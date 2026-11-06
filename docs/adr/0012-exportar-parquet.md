# ADR-0012 · Exportar a Parquet con hyparquet-writer dentro del núcleo

- **Estado:** Aceptada (2026-11-05)

## Contexto
Se pidió descargar el histórico también en Parquet, el formato columnar que leen directo pandas, polars, DuckDB y
Spark, con tipos y compresión. Escribir Parquet a mano (Thrift, páginas, Snappy) no tiene sentido; hace falta una
librería. Las dos apps exportan con `exportHistory` de `@tt/core`, y la regla de dependencias (ADR-0001,
RNF-APP-08) no deja importar librerías en el núcleo.

## Decisión
- `hyparquet-writer` (versión exacta en `packages/core/package.json`) dentro de `exportHistory`. Es JS puro, sin
  dependencias nativas ni WebAssembly, y solo usa `ArrayBuffer`/`TextEncoder`: corre igual en el navegador, en Node
  (tests) y en Hermes. `parquet-wasm` y `duckdb-wasm` se descartaron porque Hermes no ejecuta WebAssembly.
- El test de arquitectura (`packages/core/test/architecture.test.ts`) la permite en una lista explícita; cualquier
  otra librería sigue fallando. La regla de fondo no cambia: el núcleo no usa React ni APIs de plataforma.
- El archivo tiene las mismas columnas que el CSV, más `time_utc` como `TIMESTAMP`; las cifras van como `DOUBLE`,
  los huecos como `null`, y la resolución y las unidades en los metadatos clave-valor. Compresión Snappy.

## Consecuencias
- `HistoryExport.content` pasa a ser `string | Uint8Array`. La web arma el `Blob` sin `charset` para binarios y el
  móvil escribe los bytes con `expo-file-system`.
- La librería publica una entrada para Node que importa `fs`. Metro no usa la condición `browser` en Android, así que
  `apps/mobile/metro.config.js` la agrega solo para `hyparquet*`; jest la transforma (`transformIgnorePatterns`).
- Los tests leen el archivo de vuelta con `hyparquet` (misma versión que usa el escritor).
