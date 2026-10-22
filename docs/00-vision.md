# 00 · Visión

## Problema

La estación Davis Vantage Vue de ESCOM ("Liz") mide cada pocos segundos, y el pipeline en GCP guarda una lectura
cada 15 minutos desde mayo de 2026. Aun así, a la comunidad le cuesta usar esos datos:

- La consola solo expone un JSON crudo, en unidades imperiales y por HTTP. No se puede consultar desde un
  navegador por CORS, y sin contexto los valores no dicen nada a quien no es especialista.
- El histórico vive en una API sin interfaz, que corta en 1000 filas y entrega números como texto.
- Había dos apps a medias (Expo y Next.js) con lógica duplicada, sin pruebas y con errores de datos distintos en
  cada una. Por ejemplo, máximos y mínimos invertidos, o presión etiquetada como hPa que en realidad estaba en mmHg.

## Por qué esta app

Es la capa de **utilización** del sistema: el objetivo específico de *Visualización* de la tesis, más la parte
interactiva de *Analítica*. Sin ella, la ingesta, el ELT y la limpieza no llegan a nadie. Convierte las lecturas
crudas en información que se entiende al primer vistazo y sirve para estudiar el clima local:

- **Ahora:** ¿qué tiempo hace en ESCOM, cómo se siente y qué viene?
- **Histórico:** ¿cómo se comportó una variable en un periodo? Con descarga de los datos para análisis propio.
- **Interpretación:** qué significa cada variable (punto de rocío, Beaufort, tendencia de presión), para que
  también le sirva a quien no es especialista.

## Objetivos de la app

| ID | Objetivo | Objetivo específico de la tesis que atiende |
|----|----------|---------------------------------------------|
| OBJ-1 | Mostrar las condiciones actuales en web y móvil, con un retraso máximo de 2 minutos | Visualización (soft real-time) |
| OBJ-2 | Consultar, graficar y resumir el histórico por rangos de fechas | Analítica |
| OBJ-3 | Explicar cada variable en lenguaje llano | Visualización (componente educativo, RF-10 de la tesis) |
| OBJ-4 | Descargar los datos consultados en formatos abiertos (CSV/JSON) | Divulgación |
| OBJ-5 | Mantener una sola lógica, probada, para las dos plataformas | Calidad (mantenibilidad) |

## Alcance

**Incluye:**
- App web (Next.js) y app móvil (Expo, Android primero).
- Pantallas "Ahora", "Histórico" y "Carga".
- Escena del cielo animada.
- Preferencias de tema, idioma, unidades y tamaño de texto.
- Descargas.
- CI/CD con staging por PR.

**No incluye:**
- **Cuentas ni login.** La app es de solo lectura y los datos son públicos.
- **Predicción numérica** (ARIMA/SARIMA): se investigó en la tesis, pero no se implementa. El único pronóstico es
  el cualitativo que calcula la consola (`forrule`).
- **Escritura o corrección de datos.** Eso lo hace el pipeline de `proj-files`.
- **Publicación en tiendas y APK de producción.** Se generan al final y a mano (ver [ADR-0005](adr/0005-movil-ota-apk-al-final.md)).
- **Sensores que la estación no tiene:** UV, radiación solar y ET.

## Actores

| Actor | Quién | Qué necesita |
|-------|-------|--------------|
| Comunidad ESCOM | Alumnos, docentes y personal | Ver el clima actual y entenderlo rápido, sobre todo desde el móvil |
| Estudiante / investigador | Quien estudia o usa los datos | Rangos de fechas, gráficas comparables, KPIs y descarga |
| Mantenedor | Equipo del TT | Desplegar staging y producción, revisar el estado de la estación (batería, señal, conexión), diagnosticar caídas. Trabaja desde GitHub y CI, no desde una cuenta en la app |

Actores de sistema (externos): la **consola Davis** (dato en vivo), la **Cloud Function `obtener-datos-clima`**
(histórico), **GitHub Actions** (CI/CD), **Cloud Run** (hosting web) y **EAS** (actualizaciones móviles).

## Restricciones

- Hay que usar las fuentes que ya existen: no se crean APIs de datos nuevas. El único componente de servidor
  nuevo es el proxy del dato en vivo, dentro de la app web.
- El costo de hosting debe quedar en la capa gratuita, o lo más cerca posible (RNF-09 de la tesis: menos de
  30 USD al mes para todo el sistema).
- El diseño visual es el canvas de Claude Design "Estación meteorológica" (ver [07 · Interfaz](07-interfaz.md)).
