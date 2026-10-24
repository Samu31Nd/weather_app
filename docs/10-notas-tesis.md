# 10 · Notas para la tesis (caps. 6 y 7)

Qué cambia en `documentTT` después de rehacer la app. Las secciones 00–09 de `docs/` son la fuente completa; aquí
solo se dice **qué sección de la tesis queda vieja y de dónde sale el texto nuevo**, para condensarlo al pasarlo a
LaTeX. Lo que toca el pipeline de datos (adquisición, Cloud SQL, vistas, Open Data) no cambia con la app; sus
diferencias están en `~/Descargas/proj-files/docs/reporte_cambios_ingesta.md`.

## Capítulo 6 · Arquitectura del sistema

### 6.1 Requerimientos

- RF-01…07 (pipeline) siguen igual.
- RF-08, RF-09 y RF-10 hablan de "la interfaz web". La app tiene ahora sus propios requerimientos por capacidad
  (RF-APP-01…10 y RNF-APP-01…11), que aplican igual a web y a móvil. Lo más limpio es una subsección
  "Requerimientos de la aplicación" con esas dos tablas condensadas, y que RF-08…10 apunten a ellas. La columna
  "Refina" de [01 · Requerimientos](01-requerimientos.md) dice qué RF-APP detalla a cada RF de la tesis, y la
  sección "Diferencias con el cap. 6" de ese mismo documento lista lo que cambió.
- Los criterios de aceptación de cada RF-APP son verificables y tienen su prueba en la matriz de
  [08 · Calidad y pruebas](08-calidad-pruebas.md); sirven para el cap. 8 (Resultados).

### 6.x Casos de uso (sección nueva)

- Diagrama UML: [`diagramas/casos-de-uso.puml`](diagramas/casos-de-uso.puml). Exportar a SVG o PNG con PlantUML.
  Actores: Comunidad ESCOM y Estudiante/investigador (que hereda los casos de la comunidad); la consola Davis y la
  Cloud Function son actores de sistema. No hay actor "mantenedor": el despliegue va en el anexo.
- Especificación de cada CU (precondición, flujo principal y alternos): [02 · Casos de uso](02-casos-de-uso.md).
  En la tesis basta una tabla por CU.

### 6.2 Arquitectura general

- Agregar al diagrama de componentes los contenedores de la app: web Next.js en **Cloud Run** (con el proxy
  `/api/live`), app móvil Expo con **EAS Update**, y la Cloud Function de histórico consultada directo desde el
  cliente (CORS `*`). El diagrama C4 está en [03 · Arquitectura](03-arquitectura.md).
- Ya no existe el despliegue en Vercel (retirado el 24-oct-2026, repo `weather-dashboard` archivado).
- Nueva subsección **"Arquitectura de la aplicación"**: monorepo con npm workspaces, núcleo hexagonal compartido
  (`@tt/core`) y paquetes de presentación compartidos (`@tt/tokens`, `@tt/i18n`, `@tt/sky-art`); web y móvil solo
  aportan su UI y sus adaptadores de plataforma. Fuente: [03 · Arquitectura](03-arquitectura.md) y los ADR
  0001–0010 (una línea por decisión basta, con su porqué).
- El modelo de dominio (entidades, puertos, casos de uso) está como diagrama de clases en
  [04 · Modelo de dominio](04-modelo-dominio.md).

## Capítulo 7 · Implementación

### 7.x Desarrollo de la interfaz de visualización (se reescribe)

| Lo que dice hoy la tesis | Lo que hay ahora |
|---|---|
| Una app web; `WeatherEntity`, `GetWeatherUseCase`, `WeatherApiAdapter` con Axios | Dos apps (web y móvil) sobre `@tt/core`: `LiveReading`, `GetLiveWeather`, `HttpLiveWeatherRepository` + `mapDavisLive`, armados por `createCore` (inyección explícita, sin singletons) |
| Proxies de Next para el dato en vivo **y** el histórico | Solo el dato en vivo pasa por `/api/live` (URL fija, caché de 10 s, sin MAC/IP/SSID); el histórico se pide directo a la Cloud Function |
| Contexto global `useApp` | Providers `useCore` y `usePreferences`; preferencias (tema, idioma, unidades, tamaño de texto) en las claves `wx-*` de `localStorage`/AsyncStorage |
| SWR cada 5 min con revalidación al enfocar | Consulta cada 60 s y a pedido, con la vigencia del dato ("hace N s", desactualizado, sin conexión) |
| Rejilla bento de 1/2/4 columnas | Diseño de Claude Design: rejilla de 1/2/3 columnas en web y una columna en móvil, con 21 escenas del cielo animadas y pantalla de carga |
| Histórico: día específico, rango de fechas y "últimos 1–30 días" con slider | Atajos 24 h / 7 / 30 / 90 días y "últimos N días" (desde el 19-abr-2026); resolución 15 min…1 mes limitada a 4–800 puntos |
| Caché de `localStorage` y esqueleto de carga | Las consultas ya hechas se guardan en memoria durante la sesión; el periodo largo se pide en tramos de 10 días en paralelo (tope de 1000 filas) |
| `LineChart` de MUI X con interpolación catmull-Rom | Gráficas SVG propias: curva monótona que pasa por cada punto sin inventar picos, bandas mín–máx, barras de lluvia, acumulado, rosa de los vientos y cursor compartido. La geometría vive en `@tt/core` (ADR-0006) |
| Descarga JSON del estado y CSV | CSV/JSON de lo que se ve (resolución y variables visibles), con la unidad en cada columna y huecos vacíos; en móvil por la hoja de compartir |

Material para reescribirla:
- Pantallas y preferencias: [07 · Interfaz](07-interfaz.md). Capturas nuevas: "Ahora" y "Histórico" en web
  (claro y oscuro) y en móvil; reemplazan a las figuras de MUI.
- Diagramas de secuencia (dato en vivo con polling y proxy, histórico por tramos, cambio de preferencias):
  [05 · Flujos](05-flujos.md). Reemplazan a los diagramas de secuencia del dashboard y del pipeline en el cliente.
- Escena del cielo: la regla de 7 capas (nota `skyMap` del diseño) está en [06 · Datos](06-datos.md); el arte se
  extrae del canvas (ADR-0009) y en móvil sus animaciones se reproducen como datos (ADR-0010).

### 7.x Calidad de los datos en la app (subsección nueva)

Las rarezas de las fuentes se corrigen en un solo lugar (los mappers de `@tt/core`), cada una con su prueba. Las
que conviene contar en la tesis, porque cambian lo que el usuario ve:
- **D1:** el orden real de los extremos `hl*` (los dos mappers previos estaban mal).
- **D2/D3:** la presión del histórico viene en mmHg y, desde el 20-oct-2026, reducida a nivel del mar; las
  lecturas previas sin corregir se descartan al graficar.
- **D5:** `wind_dir` y `hi_dir` intercambiados en la captura automática; se corrige en el pipeline.
- **D7/D9/D11:** un día de retraso, fecha + hora en hora de CDMX y extremos incluidos al consultar por rango.
- **D12:** la consola tiene la zona horaria en UTC−5; la app compensa amanecer y ocaso.

Tabla completa: [06 · Datos](06-datos.md).

### 7.x Pruebas y despliegue

- Estrategia por capa y matriz de trazabilidad RF → CU → componente → prueba: [08 · Calidad y pruebas](08-calidad-pruebas.md).
  Cifras al 25-oct-2026: 717 pruebas automatizadas (núcleo 325, arte 166, web 103, i18n 50, tokens 42, móvil 31)
  y cobertura de líneas del núcleo de 99.7 %. Van mejor en el cap. 8.
- CI/CD, staging por PR y producción separada para web y móvil: [09 · Despliegue](09-despliegue.md). Va en un
  anexo, no en el cuerpo (decisión de la fase D).

## Figuras que se reemplazan

| Figura actual | Reemplazo |
|---|---|
| Diagrama de la arquitectura hexagonal | Componentes por capa de [03 · Arquitectura](03-arquitectura.md) |
| Panel principal claro / oscuro | Capturas de "Ahora" (web y móvil, ambos temas) |
| Secuencia UML del dashboard | Secuencia del dato en vivo de [05 · Flujos](05-flujos.md) |
| Controles de consulta (día, rango, últimos N días) | Captura de los controles del histórico |
| Secuencia del pipeline de gráficas | Secuencia del histórico por tramos de [05 · Flujos](05-flujos.md) |
| Gráficos históricos (MUI) | Capturas de las secciones del histórico |
| Flujo de descarga | Una línea: se exporta lo que se ve (`exportHistory`) |
| — (nueva) | Diagrama UML de casos de uso (`diagramas/casos-de-uso.puml`) |
