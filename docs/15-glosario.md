# 15 · Glosario

Términos que aparecen en la guía y en el código. Los de meteorología están pensados para quien viene de
computación, y los de software para quien viene de otra área.

## Meteorología y la estación

| Término | Significado |
|---------|-------------|
| **Davis Vantage Vue** | Modelo de la estación de ESCOM ("Liz"). Tiene sensores exteriores (temperatura, humedad, viento, lluvia) y una **consola** interior con presión, temperatura y humedad interiores |
| **`wflexp.json`** | Archivo JSON que la consola publica en la red local con la lectura actual |
| **Beaufort** | Escala de 0 (calma) a 12 (huracán) que clasifica el viento por sus efectos |
| **Ráfaga** | Velocidad máxima del viento en un intervalo corto; suele ser mayor que el promedio |
| **Rumbo / punto cardinal** | Dirección *desde* donde sopla el viento, en grados (0° = norte) o en 16 puntos (N, NNE, NE…) |
| **Rosa de los vientos** | Gráfica circular que muestra con qué frecuencia sopló el viento desde cada dirección |
| **Punto de rocío** | Temperatura a la que el aire se saturaría de humedad. Cuanto más cerca de la temperatura, más húmedo se siente; si casi coinciden, puede haber niebla |
| **Sensación térmica** | Temperatura que se percibe por el efecto del viento (enfriamiento) o de la humedad (índice de calor) |
| **Presión a nivel del mar** | Presión corregida como si la estación estuviera al nivel del mar, para compararla con otras estaciones. En ESCOM (2240 m) la presión real es mucho menor (D3) |
| **Tendencia de presión** | Si la presión sube o baja en las últimas 3 h; una bajada rápida suele anunciar mal tiempo |
| **Intensidad de lluvia** | Lluvia por hora (mm/h) en este momento, distinta de la lluvia acumulada del día |
| **Pronóstico Davis** | Regla (1 de 195) que la consola elige a partir de presión, viento y otras señales; la app la traduce a texto e ícono |
| **CDMX (UTC−6)** | Zona horaria en la que la app calcula días, semanas y horas. México abolió el horario de verano en 2022 |
| **D1…D13** | Identificadores de las rarezas conocidas de los datos, en [06 · Datos](06-datos.md) |

## Software y arquitectura

| Término | Significado |
|---------|-------------|
| **Monorepo** | Un solo repositorio con varios proyectos (aquí, dos apps y cuatro paquetes) que comparten código |
| **Workspace (npm)** | Cada proyecto dentro del monorepo; npm los instala juntos y los enlaza entre sí |
| **Arquitectura hexagonal** (puertos y adaptadores) | Forma de organizar el código en la que la lógica del negocio no sabe nada de pantallas, red ni almacenamiento; esas cosas se conectan desde afuera |
| **Dominio** | Las reglas del problema (convertir unidades, decidir la escena del cielo), escritas sin depender de la tecnología |
| **Puerto** | Interfaz que el dominio define para pedir algo al exterior ("dame la lectura actual") |
| **Adaptador** | Implementación concreta de un puerto ("pídela por HTTP a esta URL") |
| **Caso de uso** | Una acción completa que la app ofrece (`GetHistory`), que coordina dominio y puertos |
| **Mapper** | Función que traduce el formato de una fuente externa al modelo de la app; aquí se corrigen las rarezas |
| **DTO** | *Data Transfer Object*: el tipo que describe los datos tal como llegan, antes del mapper |
| **Modelo de vista** | Objeto con todo lo que una pantalla necesita ya calculado (`CurrentConditions`, `HistoryView`) |
| **Composition root / contenedor** | El único lugar donde se crean y conectan todas las piezas (`createCore`) |
| **Inyección de dependencias (DI)** | Pasarle a un objeto lo que necesita en lugar de que lo cree él; permite usar dobles en las pruebas |
| **Doble de prueba** | Implementación falsa (repositorio en memoria, reloj fijo) que sustituye a la real en una prueba |
| **Fixture** | Archivo con datos reales guardado para que las pruebas los usen |
| **Prueba de contrato** | Prueba que consulta las fuentes reales para comprobar que siguen entregando la forma esperada |
| **Componente (React)** | Función que recibe datos (*props*) y devuelve lo que se dibuja |
| **Hook (React)** | Función `use…` que da estado o efectos a un componente (`useLiveWeather`) |
| **Provider / contexto (React)** | Mecanismo para que muchos componentes lean un mismo valor (el núcleo, las preferencias) sin pasarlo a mano |
| **Route handler** | Función de Next.js que responde a una URL del servidor (`/api/live`) |
| **Proxy** | Servidor intermedio que hace la petición en nombre del cliente |
| **CORS** | Regla del navegador que impide a una página leer respuestas de otro dominio que no lo autorice |
| **Token de diseño** | Valor con nombre del sistema visual (un color, un tamaño) que comparten diseño y código |
| **WCAG / AA** | Pautas de accesibilidad web; el nivel AA pide, entre otras cosas, contraste de 4.5:1 en texto |
| **TalkBack** | Lector de pantalla de Android |
| **Metro** | Empaquetador de JavaScript de React Native (el equivalente a webpack/Vite) |
| **Hermes** | Motor de JavaScript que corre la app en Android |
| **Expo Go** | App de Expo que abre proyectos en desarrollo sin compilarlos |
| **APK** | Archivo instalable de una app de Android |
| **CNG** | *Continuous Native Generation*: el proyecto nativo (`/android`) se genera en cada build a partir de `app.json` |
| **EAS** | *Expo Application Services*: la nube de Expo para compilar (Build) y publicar actualizaciones (Update) |
| **OTA / EAS Update** | *Over the air*: actualizar el JavaScript de la app instalada sin reinstalarla |
| **Worklet** | Función que reanimated ejecuta en el hilo de UI, para animaciones fluidas |
| **CI/CD** | Integración continua (correr pruebas en cada cambio) y despliegue continuo (publicar automáticamente) |
| **Cloud Run** | Servicio de Google Cloud que corre un contenedor y escala a cero cuando nadie lo usa |
| **WIF** | *Workload Identity Federation*: GitHub Actions se autentica en GCP sin guardar llaves |
| **Terraform** | Herramienta para describir la infraestructura como código |
| **ADR** | *Architecture Decision Record*: documento corto que registra una decisión, su contexto y sus consecuencias |
| **Conventional Commits** | Convención para escribir mensajes de commit con tipo y alcance (`fix(mobile): …`) |
| **Squash merge** | Unir un PR a `main` como un solo commit |
| **Parquet** | Formato de archivo por columnas para análisis de datos (pandas, DuckDB, Spark) |
| **RF / RNF / CU** | Requerimiento funcional, requerimiento no funcional, caso de uso (con sus IDs `RF-APP-NN`, `RNF-APP-NN`, `CU-NN`) |
