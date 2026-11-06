#!/usr/bin/env bash
# Genera docs/guia-tecnica.pdf a partir de los Markdown de docs/ (ver docs/pdf/README.md).
#
# Requiere: pandoc ≥ 3, pdfLaTeX (TeX Live con latexextra), rsvg-convert (librsvg) y un navegador Chromium,
# Chrome o Brave para dibujar los diagramas Mermaid.
#
# Variables opcionales:
#   GUIA_BROWSER   ruta del navegador (por defecto, el primero que encuentre)
#   MERMAID_JS     ruta de un mermaid.min.js local (por defecto se descarga la versión fijada abajo)
set -euo pipefail

MERMAID_VERSION=11.17.2
DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PDF_DIR="$DOCS_DIR/pdf"
CACHE_DIR="$PDF_DIR/.cache"
OUTPUT="$DOCS_DIR/guia-tecnica.pdf"

for tool in pandoc pdflatex rsvg-convert; do
  command -v "$tool" >/dev/null || { echo "Falta $tool (ver docs/pdf/README.md)" >&2; exit 1; }
done

if [[ -z "${GUIA_BROWSER:-}" ]]; then
  for candidate in chromium chromium-browser google-chrome google-chrome-stable brave brave-browser; do
    if command -v "$candidate" >/dev/null; then GUIA_BROWSER="$(command -v "$candidate")"; break; fi
  done
fi
[[ -n "${GUIA_BROWSER:-}" ]] || { echo "Falta un navegador Chromium, Chrome o Brave (o define GUIA_BROWSER)" >&2; exit 1; }

mkdir -p "$CACHE_DIR"
if [[ -n "${MERMAID_JS:-}" ]]; then
  cp "$MERMAID_JS" "$CACHE_DIR/mermaid.min.js"
elif [[ ! -f "$CACHE_DIR/mermaid.min.js" ]]; then
  curl -fsSL "https://cdn.jsdelivr.net/npm/mermaid@$MERMAID_VERSION/dist/mermaid.min.js" -o "$CACHE_DIR/mermaid.min.js"
fi

# Portada (portada.tex): fecha en español y rutas de los escudos. LaTeX corre en una carpeta temporal, así que
# las rutas van absolutas.
MONTHS=(enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre)
DATE="$(date +%-d) de ${MONTHS[$(( $(date +%-m) - 1 ))]} de $(date +%Y)"
cat > "$CACHE_DIR/portada-datos.tex" <<EOF
\\graphicspath{{$PDF_DIR/img/}}
\\newcommand{\\guiafecha}{$DATE}
EOF

# Separadores de partes: comentarios HTML que guia.lua convierte en \part y \appendix de LaTeX.
part() { printf '<!-- part: %s -->\n' "$2" > "$CACHE_DIR/$1.md"; echo ".cache/$1.md"; }
appendix() { printf '<!-- appendix -->\n' > "$CACHE_DIR/apendices.md"; echo ".cache/apendices.md"; }

# Orden de lectura del PDF. Los nombres de archivo conservan su número para los enlaces del repositorio.
cd "$DOCS_DIR"
CHAPTERS=(
  pdf/presentacion.md
  "pdf/$(part parte-1 'Visión y especificación')"
  00-vision.md 01-requerimientos.md 02-casos-de-uso.md 07-interfaz.md
  "pdf/$(part parte-2 'Diseño técnico')"
  03-arquitectura.md 04-modelo-dominio.md 05-flujos.md 06-datos.md
  "pdf/$(part parte-3 'Implementación y desarrollo')"
  12-implementacion.md 11-entorno-desarrollo.md 13-contribuir.md 08-calidad-pruebas.md
  "pdf/$(part parte-4 'Operación')"
  09-despliegue.md 14-mantenimiento.md
  "pdf/$(appendix)"
  15-glosario.md
  adr/README.md adr/0*.md
  10-notas-tesis.md
)

GUIA_CACHE="$CACHE_DIR" GUIA_BROWSER="$GUIA_BROWSER" pandoc "${CHAPTERS[@]}" \
  --file-scope \
  --from=gfm \
  --metadata-file="$PDF_DIR/metadata.yaml" \
  --lua-filter="$PDF_DIR/guia.lua" \
  --include-in-header="$PDF_DIR/header.tex" \
  --include-in-header="$CACHE_DIR/portada-datos.tex" \
  --include-before-body="$PDF_DIR/portada.tex" \
  --top-level-division=chapter \
  --toc --toc-depth=2 \
  --pdf-engine=pdflatex \
  --resource-path="$DOCS_DIR" \
  -o "${GUIA_OUTPUT:-$OUTPUT}"

echo "Generado: ${GUIA_OUTPUT:-$OUTPUT}"
