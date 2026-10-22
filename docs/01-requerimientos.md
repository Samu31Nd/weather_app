# 01 · Requerimientos

Cada requerimiento indica:

- **Plataforma:** W = web, M = móvil, W+M = las dos.
- **Prioridad (MoSCoW):** **M**ust, **S**hould, **C**ould.
- **Origen:** diseño (canvas), tesis, decisión del equipo o dato del sistema.
- **Refina:** el requerimiento de la tesis (cap. 6) que detalla, si hay alguno.
- **Criterio de aceptación:** cómo se comprueba que se cumple.

## Requerimientos funcionales

### Condiciones actuales (pantalla "Ahora")

| ID | Requerimiento | Plat. | Prio. | Origen | Refina |
|----|---------------|-------|-------|--------|--------|
| RF-APP-01 | Mostrar las condiciones actuales: temperatura exterior, sensación térmica y su motivo, humedad, viento, lluvia del día y presión | W+M | M | Diseño | RF-08 |
| RF-APP-02 | Refrescar el dato en vivo cada 60 s, mostrar su antigüedad ("hace N s") y permitir actualizarlo a mano | W+M | M | Diseño | RF-08 |
| RF-APP-03 | Mostrar una escena del cielo animada, elegida con la regla `skyMap` (hora del día, pronóstico, lluvia medida, viento, temperatura, neblina, estado del sistema) | W+M | S | Diseño | — |
| RF-APP-04 | Mostrar el pronóstico cualitativo de la consola (`forrule`) como frase en el idioma elegido | W+M | S | Diseño | — |
| RF-APP-05 | Mostrar amanecer, mediodía solar, ocaso y la posición actual del sol en su trayecto | W+M | S | Diseño | — |
| RF-APP-06 | Mostrar el viento en un compás con dirección, velocidad, ráfaga y fuerza en escala Beaufort | W+M | M | Diseño | — |
| RF-APP-07 | Mostrar la presión con su tendencia de 3 h y la variación del día | W+M | S | Diseño | — |
| RF-APP-08 | Mostrar la humedad con su rango del día, el punto de rocío y una interpretación | W+M | S | Diseño | RF-10 |
| RF-APP-09 | Mostrar la lluvia: intensidad actual y acumulados de 15 min, 1 h, día, 24 h, tormenta, mes y año | W+M | M | Diseño | — |
| RF-APP-10 | Mostrar las condiciones interiores (temperatura y humedad) con un indicador de confort | W+M | C | Diseño | — |
| RF-APP-11 | Mostrar la temperatura del día y del mes (mínima y máxima) con la posición actual dentro del rango | W+M | S | Diseño | — |
| RF-APP-12 | Mostrar el estado de la estación: batería, señal y tiempo encendida. Nunca mostrar MAC, IP ni SSID | W+M | S | Diseño, decisión | — |

### Histórico

| ID | Requerimiento | Plat. | Prio. | Origen | Refina |
|----|---------------|-------|-------|--------|--------|
| RF-APP-13 | Elegir el periodo: últimos N días (con atajos) o un rango personalizado de fechas | W+M | M | Diseño | RF-09 |
| RF-APP-14 | Elegir la resolución de las gráficas (15 min, hora, día). Por defecto se elige una según el largo del rango | W+M | S | Diseño | RF-08 |
| RF-APP-15 | Graficar temperatura (media con banda mín./máx.) y humedad relativa, con la opción de mostrar el interior | W+M | M | Diseño | RF-08 |
| RF-APP-16 | Graficar velocidad y ráfaga del viento, y mostrar una rosa de los vientos por dirección y rango de velocidad | W+M | M | Diseño | RF-08 |
| RF-APP-17 | Graficar la lluvia por intervalo y su acumulado | W+M | M | Diseño | RF-08 |
| RF-APP-18 | Graficar la presión con su banda, la tendencia y su eje Y ajustado a los datos | W+M | M | Diseño | RF-08 |
| RF-APP-19 | Calcular KPIs del periodo para cada variable: máx./mín. con fecha y hora, media, amplitud, ráfaga máx., dirección dominante, % de calma, total de lluvia, días con lluvia, día más lluvioso, intensidad máx. e indicadores de presión | W+M | M | Diseño | — |
| RF-APP-20 | Descargar en CSV y en JSON los datos del periodo consultado | W+M | S | Diseño, tesis | — |
| RF-APP-21 | Consultar periodos de más de 10 días sin chocar con el tope de 1000 filas, partiendo la consulta en varias | W+M | S | Dato del sistema | RF-09 |

### Preferencias y transversales

| ID | Requerimiento | Plat. | Prio. | Origen | Refina |
|----|---------------|-------|-------|--------|--------|
| RF-APP-22 | Cambiar las unidades entre métrico (°C, km/h, mm, hPa/mmHg) e imperial (°F, mph, in, inHg) | W+M | M | Diseño | — |
| RF-APP-23 | Cambiar el idioma entre español e inglés | W+M | M | Diseño | — |
| RF-APP-24 | Elegir el tema: sistema, claro u oscuro. El cambio manual debe funcionar también en web | W+M | M | Diseño | — |
| RF-APP-25 | Cambiar el tamaño del texto (chico, mediano, grande) | W+M | S | Diseño | — |
| RF-APP-26 | Guardar las preferencias entre sesiones, en el mismo dispositivo | W+M | M | Diseño | — |
| RF-APP-27 | Explicar cada variable en lenguaje llano: qué es, cómo leerla y qué indica el valor actual | W+M | S | Tesis | RF-10 |
| RF-APP-28 | Mostrar una pantalla de carga con avance mientras llega el primer dato | W+M | S | Diseño | — |
| RF-APP-29 | Avisar cuando el dato es viejo o la estación no responde, sin bloquear la última lectura válida | W+M | M | Decisión | — |
| RF-APP-30 | Navegar entre "Ahora" e "Histórico" | W+M | M | Diseño | — |

### Criterios de aceptación (funcionales)

| ID | Criterio |
|----|----------|
| RF-APP-01 | Con un `wflexp.json` de prueba, cada campo aparece en la unidad elegida. Un `---` se muestra como "sin dato", nunca como 0 ni como `NaN` |
| RF-APP-02 | Sin tocar nada, la app vuelve a consultar cada 60 ± 5 s. El contador de antigüedad avanza cada segundo. El botón dispara una consulta y muestra "Actualizando…" |
| RF-APP-03 | Hay un test por cada una de las escenas del canvas que, desde sus entradas, obtiene esa escena. Con `prefers-reduced-motion` o la opción equivalente del sistema no hay animación |
| RF-APP-04 | Las reglas 0–194 dan una frase en es/en. La 193 da "Calibrando", y un código fuera de rango da "Sin conexión" |
| RF-APP-05 | Con `sunrt=7:31` y `sunst=19:16`, el mediodía solar es 13:23 y la posición del sol es correcta a una hora dada |
| RF-APP-06 | La aguja apunta a `winddir`. La fuerza Beaufort coincide con la tabla oficial en todos sus límites |
| RF-APP-07 | La tendencia sale de `bartr`, cuya semántica se confirma en la fase 1. La variación del día sale de los valores `hl*` |
| RF-APP-08 | El punto de rocío coincide con `dew` de la consola (±1 °C). La interpretación cambia según rangos documentados en `06-datos.md` |
| RF-APP-09 | Los acumulados se convierten de in a mm con la precisión del pluviómetro (0.2 mm) |
| RF-APP-10 | El confort usa rangos documentados (p. ej. 20–24 °C y 40–60 % = cómodo) |
| RF-APP-11 | Usa `hltempout[4..7]` con su orden correcto (máx./mín. del día, máx./mín. del mes), probado con un fixture real |
| RF-APP-12 | Ni el DOM ni el árbol nativo contienen la MAC, la IP ni el SSID (lo verifica un test) |
| RF-APP-13 | Los atajos (1, 3, 7, 30 días) y el rango personalizado dan la consulta `date_start/date_end` esperada en hora de Ciudad de México |
| RF-APP-14 | Un rango de 1 día usa 15 min, uno de 7 días usa hora y uno de 30 días usa día, salvo que el usuario elija otra |
| RF-APP-15…18 | Cada gráfica se dibuja con datos de prueba conocidos. Los huecos en los datos se ven como cortes en la línea, no como ceros |
| RF-APP-19 | Los KPIs de un fixture se comparan contra valores calculados a mano en el test |
| RF-APP-20 | El archivo descargado tiene una fila por cada lectura del periodo, encabezados documentados y la unidad en el nombre de la columna |
| RF-APP-21 | Un rango de 30 días hace al menos 3 consultas, las une sin duplicados y las ordena de la más vieja a la más nueva |
| RF-APP-22…26 | Al cambiar una preferencia, la UI se actualiza sin recargar. Tras reiniciar la app, se conserva |
| RF-APP-27 | Cada tarjeta de variable tiene su texto de ayuda en es/en (lo verifica un test de catálogo) |
| RF-APP-28 | La pantalla de carga se ve hasta que llega el primer dato o falla la primera consulta |
| RF-APP-29 | Un dato de más de 2 min muestra el aviso "dato desactualizado". Si la consulta falla, se ve "Sin conexión" junto con la última lectura y su hora |
| RF-APP-30 | Desde cualquier pantalla, llegar a la otra toma una interacción |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento | ISO 25010 | Refina |
|----|-----------|---------------|-----------|--------|
| RNF-APP-01 | Rendimiento | El primer dato en vivo aparece en menos de 3 s (p75) en una red 4G simulada. Un histórico de 7 días se dibuja en menos de 2 s | Eficiencia – Comportamiento temporal | — |
| RNF-APP-02 | Frescura | El dato en vivo mostrado nunca tiene más de 2 min de antigüedad sin un aviso visible | Adecuación funcional – Corrección | RF-08 |
| RNF-APP-03 | Disponibilidad | La web de producción está disponible al menos 99 % del mes. Una caída de la consola no tumba la app: muestra el estado "sin conexión" | Fiabilidad – Disponibilidad | RNF-01 |
| RNF-APP-04 | Costo | El hosting de la web y las actualizaciones móviles quedan dentro de la capa gratuita, o cuestan menos de 1 USD al mes | Eficiencia – Utilización de recursos | RNF-09 |
| RNF-APP-05 | Accesibilidad | WCAG 2.2 AA: contraste ≥ 4.5:1 en texto y ≥ 3:1 en gráficos. Objetivos táctiles ≥ 44 px. Uso completo con teclado en web. Etiquetas para lector de pantalla en gráficas e íconos. Se respeta la preferencia de movimiento reducido | Usabilidad – Accesibilidad | — |
| RNF-APP-06 | Usabilidad | Un usuario sin conocimientos técnicos consulta e interpreta una variable histórica en 3 interacciones o menos | Usabilidad – Operabilidad | RNF-10 |
| RNF-APP-07 | Compatibilidad | Web: últimas 2 versiones de Chrome, Firefox, Safari y Edge, de 360 a 1440 px sin scroll horizontal. Móvil: las versiones mínimas de Android e iOS que soporta Expo SDK 57 | Compatibilidad – Interoperabilidad | — |
| RNF-APP-08 | Fiabilidad | Los datos ausentes (`---`, `null`, filas faltantes) nunca rompen la UI. Las consultas fallidas se reintentan con backoff (máx. 3 intentos) | Fiabilidad – Tolerancia a fallos | RNF-05 |
| RNF-APP-09 | Seguridad | No hay secretos en el bundle del cliente. Todo el tráfico del cliente va por HTTPS. El proxy solo consulta el host de la estación configurado (no es un proxy abierto) y no reenvía cabeceras del cliente | Seguridad – Confidencialidad / Integridad | RNF-03 |
| RNF-APP-10 | Privacidad | La app no usa cookies de rastreo ni analítica con datos personales. Las preferencias solo se guardan en el dispositivo | Seguridad – Confidencialidad | — |
| RNF-APP-11 | Mantenibilidad | Arquitectura hexagonal: `packages/core` no depende de React ni de APIs de plataforma, y las dependencias apuntan hacia el dominio. Ningún archivo pasa de 300 líneas sin justificarlo | Mantenibilidad – Modularidad | RNF-07 |
| RNF-APP-12 | Capacidad de prueba | Cobertura de líneas de `packages/core` ≥ 80 %. Cada RF tiene al menos una prueba en la matriz de trazabilidad. Cada archivo de test documenta qué regla cubre | Mantenibilidad – Capacidad de prueba | — |
| RNF-APP-13 | Internacionalización | Todo texto visible sale de un catálogo es/en con las mismas claves. Fechas y horas se muestran en America/Mexico_City. Números con el formato del idioma | Usabilidad – Operabilidad | — |
| RNF-APP-14 | Portabilidad | La lógica de dominio y de cálculo se escribe una sola vez y la usan las dos apps sin cambios | Portabilidad – Adaptabilidad | — |
| RNF-APP-15 | Consistencia visual | La UI respeta los tokens del diseño (paleta clara/oscura, tipografía IBM Plex, espaciado) en las dos plataformas | Usabilidad – Estética de la interfaz | — |

## Diferencias con el cap. 6 de la tesis

Para actualizar después el cap. 6:
- **RF-08 y RF-09** dicen "interfaz web". Ahora aplican a **web y móvil**.
- **RF-10** (componente educativo, prioridad Baja) se detalla en RF-APP-08 y RF-APP-27, con prioridad Should.
  Pasa a ser parte de cada tarjeta y no un módulo aparte.
- La tesis no tiene requerimientos sobre:
  - datos en vivo: RF-APP-01 a RF-APP-12;
  - preferencias, i18n y accesibilidad: RF-APP-22 a RF-APP-26, RNF-APP-05 y RNF-APP-13.
- **RNF-10** se mantiene como RNF-APP-06.
