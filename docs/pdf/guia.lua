-- Filtro de pandoc para la guía técnica en PDF (docs/pdf/build.sh).
-- - Dibuja los bloques ```mermaid``` con mermaid.js en un navegador sin ventana y los inserta como PDF vectorial.
-- - Convierte los enlaces entre archivos de docs/ en enlaces internos del PDF, y los demás en enlaces a GitHub.
-- - Quita el número "NN · " de los títulos (LaTeX numera los capítulos) y baja un nivel los títulos de cada ADR.
-- - Permite cortar el código en línea largo (rutas de archivos) para que no se salga de las tablas.

local REPO_URL = 'https://github.com/Samu31Nd/weather_app'
local CACHE_DIR = os.getenv('GUIA_CACHE') or '.cache'
local BROWSER = os.getenv('GUIA_BROWSER')

local function file_exists(path)
  local handle = io.open(path, 'r')
  if handle then handle:close() return true end
  return false
end

local function write_file(path, content)
  local handle = assert(io.open(path, 'w'))
  handle:write(content)
  handle:close()
end

local function read_command(command)
  local handle = assert(io.popen(command, 'r'))
  local output = handle:read('a')
  handle:close()
  return output
end

-- Mermaid ------------------------------------------------------------------------------------------------------

local MERMAID_PAGE = [[<!doctype html><html><head><meta charset="utf-8"></head><body>
<script type="text/plain" id="source">%s</script>
<script src="mermaid.min.js"></script>
<script>
mermaid.initialize({ startOnLoad: false, theme: 'neutral', htmlLabels: false, flowchart: { htmlLabels: false },
  themeVariables: { fontFamily: 'DejaVu Sans', fontSize: '14px' } })
mermaid.render('diagram', document.getElementById('source').textContent)
  .then(function (result) { document.body.innerHTML = '<div id="out">' + result.svg + '</div>' })
  .catch(function (error) { document.body.innerHTML = '<div id="error">' + error + '</div>' })
</script></body></html>]]

-- Con `htmlLabels: false` las etiquetas de los diagramas de flujo son texto SVG (rsvg-convert no dibuja HTML): los
-- saltos van como "\n". Los diagramas de secuencia y de clases ya entienden `<br/>`.
local function svg_friendly(source)
  if not source:match('^%s*flowchart') and not source:match('^%s*graph') then return source end
  return (source:gsub('<br%s*/?>', '\n'):gsub('</?b>', ''))
end

local function render_mermaid(source)
  local name = pandoc.utils.sha1(source)
  local pdf = CACHE_DIR .. '/' .. name .. '.pdf'
  if file_exists(pdf) then return pdf end
  assert(BROWSER, 'Falta GUIA_BROWSER (Chromium, Chrome o Brave) para dibujar los diagramas')

  local page = CACHE_DIR .. '/' .. name .. '.html'
  write_file(page, MERMAID_PAGE:format(svg_friendly(source)))
  local dom = read_command(string.format(
    "timeout 60 '%s' --headless=new --disable-gpu --no-first-run --virtual-time-budget=10000 --dump-dom 'file://%s' 2>/dev/null",
    BROWSER, page))
  local svg = dom:match('<div id="out">(.*)</div>')
  if not svg then
    error('Mermaid no pudo dibujar el diagrama:\n' .. source .. '\n' .. (dom:match('<div id="error">(.-)</div>') or dom))
  end
  -- El DOM sale serializado como HTML; rsvg-convert lee XML. Mermaid separa las palabras en <tspan> que empiezan
  -- con espacio, y rsvg-convert los quita si no se le pide conservarlos.
  svg = svg:gsub('&nbsp;', '&#160;'):gsub('^<svg ', '<svg xml:space="preserve" ')
  local svg_path = CACHE_DIR .. '/' .. name .. '.svg'
  write_file(svg_path, svg)
  assert(os.execute(string.format("rsvg-convert -f pdf -o '%s' '%s'", pdf, svg_path)), 'rsvg-convert falló')
  return pdf
end

-- Alto entre ancho del diagrama, leído del viewBox del SVG.
local function aspect_ratio(pdf)
  local handle = io.open((pdf:gsub('%.pdf$', '.svg')), 'r')
  if not handle then return 1 end
  local svg = handle:read('a')
  handle:close()
  local width, height = svg:match('viewBox="[%d.-]+ [%d.-]+ ([%d.]+) ([%d.]+)"')
  return (width and height) and tonumber(height) / tonumber(width) or 1
end

-- Un diagrama mucho más alto que ancho (el de clases) no cabe a lo ancho: va en su propia página, debajo de su
-- título, con todo el alto que queda libre.
local TALL_RATIO = 1.3

local function is_mermaid(block)
  return block and block.t == 'CodeBlock' and block.classes:includes('mermaid')
end

local function is_tall(block)
  return is_mermaid(block) and aspect_ratio(render_mermaid(block.text)) > TALL_RATIO
end

local function side_by_side(left, right)
  local half = '\\begin{minipage}[c]{0.49\\linewidth}\\centering\\includegraphics[width=\\linewidth,'
    .. 'height=\\dimexpr\\textheight-9\\baselineskip\\relax,keepaspectratio]{%s}\\end{minipage}'
  return pandoc.RawBlock('latex', '\\begin{center}' .. half:format(render_mermaid(left.text)) .. '\\hfill'
    .. half:format(render_mermaid(right.text)) .. '\\end{center}')
end

local function mermaid_block(block)
  if not block.classes:includes('mermaid') then
    -- Los bloques sin lenguaje pasan por el resaltador para poder cortar líneas largas (fvextra).
    if #block.classes == 0 then block.classes:insert('default') end
    return block
  end
  -- Centrado, a lo ancho de la página y sin deformar. Siempre con tope de alto: sin él, LaTeX agrega páginas sin fin
  -- buscando dónde poner un diagrama más alto que la página.
  local height = is_tall(block) and '\\dimexpr\\textheight-7\\baselineskip\\relax' or '0.75\\textheight'
  return pandoc.RawBlock('latex', string.format(
    '\\begin{center}\\includegraphics[width=\\linewidth,height=%s,keepaspectratio]{%s}\\end{center}',
    height, render_mermaid(block.text)))
end

-- Títulos -----------------------------------------------------------------------------------------------------

-- Con --file-scope, pandoc antepone a cada id el archivo de origen en minúsculas, sin puntos y con `/` → `__`:
-- `adr/0007-proxy.md` → `adr__0007-proxymd__<id>`. Esa clave identifica el archivo en todo el filtro.
local function file_key(path)
  return (path:lower():gsub('/', '__'):gsub('%.', ''))
end

local function file_of(identifier)
  return identifier:match('^(.-md)__')
end

local function adjust_header(header)
  local file = file_of(header.identifier) or ''
  if file:match('^adr__%d') then header.level = header.level + 1 end
  if header.level == 1 and header.content[1] and header.content[1].t == 'Str' and header.content[1].text:match('^%d%d$') then
    -- "00 · Visión" → "Visión"
    for _ = 1, 4 do header.content:remove(1) end
  end
  return header
end

-- Código en línea ---------------------------------------------------------------------------------------------

local LATEX_ESCAPES = {
  ['\\'] = '\\textbackslash{}', ['{'] = '\\{', ['}'] = '\\}', ['$'] = '\\$', ['&'] = '\\&', ['#'] = '\\#',
  ['%'] = '\\%', ['_'] = '\\_', ['^'] = '\\textasciicircum{}', ['~'] = '\\textasciitilde{}',
}

local function latex_code(text, breakable)
  -- `{-}` evita que LaTeX junte `--` o `---` en un guion largo.
  local escaped = text:gsub('[\\{}$&#%%_^~]', LATEX_ESCAPES):gsub('%-', '{-}')
  if breakable then escaped = escaped:gsub('([/%.,]+)', '%1\\allowbreak{}'):gsub('{%-}', '{-}\\allowbreak{}'):gsub('(\\_)', '%1\\allowbreak{}')
    -- También entre palabras de un nombre en CamelCase (`LiveWeatherRepository`).
    escaped = escaped:gsub('(%l)(%u)', '%1\\allowbreak{}%2')
  end
  return pandoc.RawInline('latex', '\\texttt{' .. escaped .. '}')
end

-- Tablas ----------------------------------------------------------------------------------------------------

-- El lector gfm no da anchos a las columnas y LaTeX no corta el texto de las celdas: las tablas largas se salían
-- de la página. Cada columna recibe un ancho proporcional a su texto más largo (con tope, para que una celda muy
-- larga no deje sin espacio a las demás).
local MAX_COLUMN_CHARS = 60
local TABLE_LINE_CHARS = 80

local function fit_table(tbl)
  local longest, natural = {}, 0
  local function measure(rows)
    for _, row in ipairs(rows) do
      local row_length = 0
      for index, cell in ipairs(row.cells) do
        local length = utf8.len(pandoc.utils.stringify(cell.contents)) or 0
        row_length = row_length + length + 3
        longest[index] = math.max(longest[index] or 0, math.min(length, MAX_COLUMN_CHARS))
      end
      natural = math.max(natural, row_length)
    end
  end
  measure(tbl.head.rows)
  for _, body in ipairs(tbl.bodies) do measure(body.body) end

  local total = 0
  for index = 1, #tbl.colspecs do total = total + (longest[index] or 1) + 3 end
  -- Una tabla cuyas filas caben en una línea se deja con columnas naturales.
  if natural <= TABLE_LINE_CHARS then return nil end
  for index, colspec in ipairs(tbl.colspecs) do
    tbl.colspecs[index] = { colspec[1], ((longest[index] or 1) + 3) / total }
  end
  return tbl
end

-- Partes ------------------------------------------------------------------------------------------------------

-- build.sh separa las partes con `<!-- part: Título -->` y `<!-- appendix -->`.
local function part_separator(raw)
  if raw.format ~= 'html' then return nil end
  local title = raw.text:match('^<!%-%- part: (.-) %-%->')
  if title then return pandoc.RawBlock('latex', '\\part{' .. title .. '}') end
  if raw.text:match('^<!%-%- appendix %-%->') then return pandoc.RawBlock('latex', '\\appendix') end
  return {}
end

-- Enlaces -----------------------------------------------------------------------------------------------------

local function normalize(path)
  local parts = {}
  for part in path:gmatch('[^/]+') do
    if part == '..' then table.remove(parts) elseif part ~= '.' then table.insert(parts, part) end
  end
  return table.concat(parts, '/')
end

local function link_resolver(first_ids, all_ids)
  return function(current_file)
    local current_dir = (current_file:match('^(.*)__') or ''):gsub('__', '/')
    return function(link)
      local target = link.target
      if target:match('^%a[%w+.-]*:') then return link end
      if target:match('^#') then
        -- --file-scope ya convirtió `[x](09-despliegue.md)` en `#09-desplieguemd`: va al inicio del capítulo.
        local key = target:sub(2)
        if not all_ids[key] and first_ids[key] then link.target = '#' .. first_ids[key] end
        return link
      end
      local path, anchor = target:match('^([^#]*)#?(.*)$')
      local trailing_slash = path:sub(-1) == '/'
      path = normalize((current_dir ~= '' and current_dir .. '/' or '') .. path)
      if trailing_slash then path = path .. '/README.md' end
      local key = file_key(path)
      if first_ids[key] then
        local id = key .. '__' .. anchor
        link.target = '#' .. ((anchor ~= '' and all_ids[id]) and id or first_ids[key])
      else
        -- Archivo que no está en el PDF (código, diagramas): enlace a GitHub, relativo a docs/.
        local repo_path = normalize('docs/' .. path):gsub('/README%.md$', '')
        link.target = string.format('%s/%s/main/%s', REPO_URL, trailing_slash and 'tree' or 'blob', repo_path)
      end
      return link
    end
  end
end

function Pandoc(doc)
  local first_ids, all_ids = {}, {}
  doc:walk({
    Header = function(header)
      all_ids[header.identifier] = true
      local file = file_of(header.identifier)
      if file and not first_ids[file] then first_ids[file] = header.identifier end
    end,
  })

  local resolver = link_resolver(first_ids, all_ids)
  local current_file = ''
  for index, block in ipairs(doc.blocks) do
    if block.t == 'Header' then current_file = file_of(block.identifier) or current_file end
    doc.blocks[index] = block:walk({ Link = resolver(current_file) })
  end

  -- Los diagramas muy altos empiezan página junto con el título que los presenta, y dos diagramas seguidos (las dos
  -- partes del de clases) van lado a lado, cada uno en media página.
  local blocks = pandoc.Blocks({})
  local index = 1
  while index <= #doc.blocks do
    local block = doc.blocks[index]
    if block.t == 'Header' then
      local first, second = doc.blocks[index + 1], doc.blocks[index + 2]
      local starts_figure = is_tall(first) or (first and first.t == 'Para' and (is_tall(second) or is_mermaid(doc.blocks[index + 3]) and is_mermaid(second)))
      if starts_figure then blocks:insert(pandoc.RawBlock('latex', '\\clearpage')) end
    end
    if is_mermaid(block) and is_mermaid(doc.blocks[index + 1]) then
      blocks:insert(side_by_side(block, doc.blocks[index + 1]))
      index = index + 2
    else
      blocks:insert(block)
      index = index + 1
    end
  end
  doc.blocks = blocks

  -- Las tablas se miden antes de convertir el código en línea a LaTeX (stringify no ve el texto de RawInline).
  doc = doc:walk({
    Table = fit_table,
    Header = function(header)
      header = adjust_header(header)
      return header:walk({ Code = function(code) return latex_code(code.text, false) end })
    end,
  })
  return doc:walk({
    CodeBlock = mermaid_block,
    Code = function(code) return latex_code(code.text, true) end,
    RawBlock = part_separator,
  })
end
