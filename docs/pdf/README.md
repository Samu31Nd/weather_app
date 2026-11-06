# Guía técnica en PDF

`docs/guia-tecnica.pdf` reúne los Markdown de `docs/` en un solo documento con portada, índice, partes y
apéndices. Los Markdown son la fuente: el PDF se regenera después de cambiarlos y se sube en el mismo PR.

```bash
docs/pdf/build.sh        # deja docs/guia-tecnica.pdf (unos 20 s la primera vez; después, segundos)
```

## Qué necesita

| Herramienta | Para qué | Arch Linux | Debian/Ubuntu |
|-------------|----------|------------|---------------|
| pandoc ≥ 3 | Unir los Markdown y convertirlos a LaTeX | `pandoc-cli` | `pandoc` (o el `.deb` de pandoc.org si la versión es vieja) |
| pdfLaTeX con los paquetes de `latexextra` | Componer el PDF | `texlive-latexextra texlive-fontsrecommended texlive-pictures` | `texlive-latex-extra texlive-fonts-recommended` |
| rsvg-convert | Pasar los diagramas de SVG a PDF | `librsvg` | `librsvg2-bin` |
| Chromium, Chrome o Brave | Dibujar los diagramas Mermaid | — | — |
| curl | Descargar `mermaid.min.js` la primera vez | — | — |

Variables opcionales: `GUIA_BROWSER` (ruta del navegador), `MERMAID_JS` (un `mermaid.min.js` local, para no
descargarlo) y `GUIA_OUTPUT` (otra salida, por ejemplo `.tex` para revisar el LaTeX).

## Cómo funciona

| Archivo | Qué hace |
|---------|----------|
| `build.sh` | Define el **orden de lectura** (partes, capítulos y apéndices) y llama a pandoc. Un capítulo nuevo de `docs/` se agrega aquí |
| `portada.tex` | Portada con el formato de la de la tesis: escudos del IPN y la ESCOM (`img/`), título, alumnos y directores. Si cambia el equipo, se corrige aquí |
| `presentacion.md` | Primer capítulo del PDF: qué es la app, a quién va dirigida la guía y cómo está organizada |
| `metadata.yaml` | Título, idioma, márgenes y fuentes |
| `header.tex` | Ajustes de LaTeX: símbolos Unicode (✓, →, ≥…), cortes de línea en el código, tablas y encabezados |
| `guia.lua` | Filtro de pandoc: dibuja los diagramas Mermaid, convierte los enlaces entre archivos en enlaces internos (y los demás en enlaces a GitHub), quita el número de los títulos, ajusta el ancho de las tablas y separa las partes |
| `.cache/` | Diagramas ya dibujados (por hash de su código) y `mermaid.min.js`. No se versiona; borrarlo obliga a redibujar |

## Problemas conocidos

- **Un símbolo no aparece en el PDF** (pdfLaTeX avisa *Unicode character … not set up*): agrégalo con
  `\newunicodechar` en `header.tex`.
- **Un diagrama falla** con *Mermaid no pudo dibujar el diagrama*: el error de Mermaid sale en la terminal. Suele ser
  un `;` dentro de un mensaje de un diagrama de secuencia (Mermaid lo toma como fin de instrucción). Si falla aquí,
  también se ve roto en GitHub.
- **Diagramas muy altos o anchos** se reducen para caber en la página (ancho completo y hasta ¾ del alto). Uno mucho
  más alto que ancho empieza página con su título. Si uno queda ilegible, conviene partirlo: dos bloques Mermaid
  seguidos se ponen lado a lado, cada uno en media página (así va el diagrama de clases).
- **XeLaTeX o LuaLaTeX** no hacen falta. Se usa pdfLaTeX porque es el motor que viene en cualquier instalación de
  TeX Live; con los otros habría que cambiar `--pdf-engine` y las fuentes de `metadata.yaml`.
