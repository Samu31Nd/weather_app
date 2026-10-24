# 01 · Requerimientos

Los requerimientos se escriben **por capacidad**, no por tarjeta ni por pantalla. Cada uno describe algo que el
usuario puede hacer, o una cualidad que se puede medir. El detalle de qué muestra cada pantalla está en
[07 · Interfaz](07-interfaz.md).

**Columnas:**
- **Prio. (MoSCoW):** **M**ust, **S**hould, **C**ould.
- **Refina:** el requerimiento del cap. 6 de la tesis que detalla, si lo hay.
- **Todos aplican a web y móvil por igual.** Que las dos plataformas ofrezcan lo mismo es en sí un requerimiento
  (RNF-APP-06).

## Requerimientos funcionales

| ID | Requerimiento | Prio. | Refina |
|----|---------------|-------|--------|
| RF-APP-01 | **Consultar las condiciones actuales.** El sistema muestra la última lectura de la estación: temperatura y sensación térmica, humedad y punto de rocío, viento (velocidad, ráfaga, dirección y fuerza Beaufort), presión y su tendencia, lluvia (intensidad y acumulados), extremos del día y del mes, amanecer y ocaso, y condiciones interiores | M | RF-08 |
| RF-APP-02 | **Mantener la vigencia del dato.** El sistema renueva la lectura cada 60 s y a petición del usuario, indica su antigüedad y avisa si está desactualizada o si la estación no responde. En ese caso conserva la última lectura válida | M | RF-08 |
| RF-APP-03 | **Representar el estado del cielo.** El sistema resume las condiciones en una escena visual y en la frase del pronóstico de la consola. Para elegir la escena combina la hora solar, el pronóstico y las mediciones de lluvia, viento y humedad | S | — |
| RF-APP-04 | **Interpretar las variables.** Cada variable tiene una explicación en lenguaje llano de qué es, cómo se lee y qué indica su valor actual | S | RF-10 |
| RF-APP-05 | **Informar el estado de la estación.** El sistema muestra la batería, la señal y el tiempo encendida, para que el usuario sepa si puede confiar en el dato. Nunca expone datos internos de red | C | — |
| RF-APP-06 | **Consultar el histórico por periodo.** El usuario elige un periodo con atajos (últimos N días) o un rango de fechas. El sistema obtiene todas las lecturas del periodo aunque superen el límite de la fuente | M | RF-09 |
| RF-APP-07 | **Visualizar las series históricas.** El sistema grafica temperatura y humedad, viento (con rosa de los vientos), lluvia (por intervalo y acumulada) y presión. La resolución temporal es ajustable y por defecto se elige una adecuada al periodo | M | RF-08 |
| RF-APP-08 | **Resumir el periodo.** El sistema calcula indicadores por variable: extremos con fecha y hora, media, amplitud, dirección dominante y calma, total y días con lluvia, intensidad máxima y variación de presión | M | — |
| RF-APP-09 | **Exportar los datos consultados.** El usuario descarga en CSV o JSON las lecturas del periodo, con las unidades explícitas | S | — |
| RF-APP-10 | **Personalizar la presentación.** El usuario elige las unidades (métrico/imperial), el idioma (es/en), el tema (sistema/claro/oscuro) y el tamaño del texto. Las preferencias se conservan entre sesiones en el dispositivo | M | — |

### Criterios de aceptación

| ID | Criterio |
|----|----------|
| RF-APP-01 | Con un `wflexp.json` real de prueba, cada variable aparece en la unidad elegida y coincide con el valor esperado. Un campo ausente (`---`) se muestra como "sin dato", nunca como 0 ni como `NaN`. Los extremos del día y del mes respetan el orden real de los arreglos `hl*` |
| RF-APP-02 | La lectura se renueva cada 60 ± 5 s y al pulsar "Actualizar". Una lectura de más de 2 min muestra el aviso "desactualizado". Si una consulta falla, se ve "sin conexión" junto a la última lectura y su hora |
| RF-APP-03 | Hay un caso de prueba por cada una de las 21 escenas, que la produce desde sus entradas. Las reglas de pronóstico 0–194 dan una frase en es/en. La 193 da "calibrando" y un código inválido da "sin conexión" |
| RF-APP-04 | Toda variable de la pantalla "Ahora" tiene su texto de ayuda en es/en. Los umbrales de interpretación son los documentados en [06 · Datos](06-datos.md#interpretación-de-variables-rf-app-04) |
| RF-APP-05 | La interfaz no contiene la MAC, la IP ni el SSID de la estación (lo verifica un test) |
| RF-APP-06 | Un periodo de 30 días se resuelve en varias consultas, sin duplicados y en orden cronológico. Los atajos y los rangos se interpretan en hora de Ciudad de México. Un periodo sin datos lo informa en vez de dibujar gráficas vacías |
| RF-APP-07 | Con datos de prueba conocidos, cada gráfica dibuja los puntos esperados. Los huecos se ven como cortes, no como ceros. La resolución por defecto es 15 min para 1 día, 1 h para 7 días y 1 día para 30 días |
| RF-APP-08 | Los indicadores de un fixture coinciden con valores calculados a mano en el test |
| RF-APP-09 | El archivo tiene una fila por lectura del periodo y la unidad en el nombre de cada columna |
| RF-APP-10 | Cambiar una preferencia actualiza la interfaz sin recargar. Todas las pantallas se ven completas y legibles en español y en inglés, y en tema claro y oscuro. Tras reiniciar la app la preferencia se conserva. El tema manual funciona también en web |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento | ISO 25010 | Refina |
|----|-----------|---------------|-----------|--------|
| RNF-APP-01 | Corrección de los datos | Las conversiones de unidades y las correcciones de las fuentes (orden de los extremos, presión en mmHg, presión reducida a nivel del mar, código de tendencia, campos ausentes, fechas en hora local) se aplican **en un solo lugar** y se verifican con datos reales de la estación | Adecuación funcional – Corrección | RF-04 |
| RNF-APP-02 | Tolerancia a fallos | Los datos ausentes o incompletos nunca interrumpen la interfaz. Las consultas fallidas se reintentan con espera creciente (máx. 3 intentos). Si la estación no está disponible, la app sigue funcionando y lo indica | Fiabilidad – Tolerancia a fallos | RNF-05 |
| RNF-APP-03 | Rendimiento | El primer dato en vivo aparece en menos de 3 s (p75) en una red 4G simulada. Un histórico de 7 días se grafica en menos de 2 s | Eficiencia – Comportamiento temporal | RNF-02 |
| RNF-APP-04 | Usabilidad | Un usuario sin conocimientos técnicos consulta e interpreta una variable histórica en 3 interacciones o menos. La interfaz sigue el diseño de referencia (tokens de color, tipografía y espaciado) en ambos temas | Usabilidad – Operabilidad / Estética | RNF-10 |
| RNF-APP-05 | Accesibilidad | Cumple WCAG 2.2 AA **en el tema claro y en el oscuro**: contraste ≥ 4.5:1 en texto y ≥ 3:1 en gráficos, objetivos táctiles ≥ 44 px, uso completo con teclado en web, descripciones para lector de pantalla en gráficas e íconos, y respeto de la preferencia de movimiento reducido | Usabilidad – Accesibilidad | — |
| RNF-APP-06 | Multiplataforma | Web (de 360 a 1440 px, últimas 2 versiones de los navegadores principales) y móvil (Android e iOS en las versiones que soporta Expo SDK 58) ofrecen las mismas capacidades | Compatibilidad / Portabilidad – Adaptabilidad | RF-08 |
| RNF-APP-07 | Internacionalización | La interfaz completa está disponible en **español** (predeterminado) e **inglés**, sin textos fijos en el código: todo sale de catálogos con las mismas claves en ambos idiomas, incluidos el pronóstico, las interpretaciones y los mensajes de error. Fechas y horas se muestran en America/Mexico_City, y números y fechas con el formato del idioma elegido | Usabilidad – Operabilidad | — |
| RNF-APP-08 | Mantenibilidad | Arquitectura hexagonal: la lógica de dominio y los casos de uso viven una sola vez en un núcleo compartido, sin dependencias de React ni de la plataforma, y las dos apps lo consumen sin cambios | Mantenibilidad – Modularidad / Reusabilidad | RNF-07 |
| RNF-APP-09 | Capacidad de prueba | El núcleo tiene una cobertura de líneas ≥ 80 %. Cada RF tiene al menos una prueba en la matriz de trazabilidad, y cada archivo de prueba documenta la regla que verifica y su origen | Mantenibilidad – Capacidad de prueba | — |
| RNF-APP-10 | Seguridad y privacidad | Sin secretos en el código del cliente y con tráfico cifrado entre el cliente y el servidor. El intermediario del dato en vivo solo consulta la estación configurada. No se usan cookies de rastreo y las preferencias solo se guardan en el dispositivo | Seguridad – Confidencialidad / Integridad | RNF-03 |
| RNF-APP-11 | Uso de recursos | La app no satura la consola: a lo mucho 1 consulta cada 10 s, sin importar el número de usuarios. No repite consultas al histórico ya obtenidas en la sesión | Eficiencia – Utilización de recursos | RNF-09 |

## Diferencias con el cap. 6 de la tesis

Son notas para actualizar después el cap. 6:
- **RF-08 y RF-09** hablan de "interfaz web". Ahora aplican a **web y móvil** (RNF-APP-06).
- **RF-10** (componente educativo, prioridad Baja) pasa a ser RF-APP-04, con prioridad Should, y queda integrado
  en cada variable en lugar de ser un módulo aparte.
- La tesis no tiene requerimientos para:
  - el dato en vivo (RF-APP-01 a RF-APP-03);
  - la personalización (RF-APP-10);
  - la accesibilidad (RNF-APP-05);
  - la internacionalización (RNF-APP-07).
- **RNF-APP-01** traslada a la app la idea de RF-04 (validación y limpieza): las correcciones de datos que el
  pipeline no hace se aplican en el núcleo.
