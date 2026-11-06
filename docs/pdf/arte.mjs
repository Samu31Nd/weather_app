// Saca una escena del cielo de @tt/sky-art como SVG suelto, para la portada y las partes de la guía en PDF.
// Uso: node arte.mjs <scenes.generated.ts> <escena> <salida.svg>
import { readFileSync, writeFileSync } from 'node:fs'
const [src, scene, out] = process.argv.slice(2)
const text = readFileSync(src, 'utf8')
const match = text.match(new RegExp(`"${scene}": \\{\\s*"viewBox": "([^"]+)"[\\s\\S]*?"body": ("(?:[^"\\\\]|\\\\.)*")`))
if (!match) throw new Error(`No encontré la escena ${scene}`)
writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${match[1]}">${JSON.parse(match[2])}</svg>`)
