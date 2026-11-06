# Presentación

Esta guía técnica describe por completo la aplicación web y móvil de la **Plataforma de Monitoreo y
Visualización Meteorológica** de la ESCOM (IPN), desarrollada como Trabajo Terminal 2026-B033. Reúne en un solo
documento la especificación, el diseño técnico, la implementación, la forma de contribuir y la operación del
sistema, para que el proyecto pueda consultarse, evaluarse y continuarse sin depender de quien lo escribió.

## Qué es la aplicación

La estación meteorológica Davis Vantage Vue de la ESCOM mide temperatura, humedad, viento, lluvia y presión cada
pocos segundos. Un *pipeline* de datos en Google Cloud (fuera de este repositorio) guarda una lectura cada 15
minutos. La aplicación es la cara visible de ese sistema:

- **Ahora:** las condiciones actuales, actualizadas cada 60 segundos, con una ilustración animada del cielo, el
  pronóstico de la consola y la explicación de cada variable.
- **Histórico:** gráficas, indicadores y rosa de los vientos de cualquier periodo desde abril de 2026, con descarga
  de los datos en CSV, JSON o Parquet.
- **Widgets de Android** con la lectura actual en la pantalla de inicio.

Todo en español o inglés, tema claro u oscuro, unidades métricas o imperiales y tres tamaños de letra.

- Web: <https://weather-web-nspsuyfpwa-uc.a.run.app>
- Código: <https://github.com/Samu31Nd/weather_app>

## A quién va dirigida

| Si eres… | Te sirve sobre todo |
|----------|---------------------|
| **Profesor o sinodal** que revisa el trabajo | Parte I (qué se pidió y para quién) y Parte II (cómo se diseñó); el capítulo de calidad y pruebas, con la matriz de trazabilidad, muestra cómo se verifica cada requerimiento |
| **Estudiante que retoma el proyecto** | Empieza por *Implementación* y *Entorno de desarrollo*; después *Cómo contribuir* antes de tu primer cambio |
| **Responsable de operar el sistema** | Parte IV: despliegue, mantenimiento y la lista de traspaso |
| **Alguien que solo quiere usar los datos** | *Datos* (qué significa cada campo y sus rarezas) y el glosario |

No se presupone experiencia con React, Expo ni Google Cloud. Los términos técnicos se explican la primera vez que
aparecen y están reunidos en el **glosario** del apéndice. Sí ayuda saber programar en algún lenguaje y conocer lo
básico de Git.

## Cómo está organizada

- **Parte I · Visión y especificación.** El problema, los objetivos, los requerimientos (`RF-APP-NN`,
  `RNF-APP-NN`), los casos de uso (`CU-NN`) y la interfaz.
- **Parte II · Diseño técnico.** Arquitectura, modelo de dominio, flujos y el diccionario de datos con sus rarezas
  (`D1`…`D13`).
- **Parte III · Implementación y desarrollo.** Cómo está construido el código, cómo preparar el entorno, cómo
  contribuir y cómo se prueba.
- **Parte IV · Operación.** Despliegue, CI/CD, costos, mantenimiento y traspaso.
- **Apéndices.** Glosario, registro de decisiones de arquitectura (ADR) y notas para la tesis.

Los identificadores (`RF-APP-07`, `CU-04`, `D5`, `ADR-0013`) se citan en el código, en las pruebas y en los *pull
requests*: buscarlos en el repositorio lleva directo a dónde se implementan y se prueban.

## De dónde sale este documento

El PDF se genera a partir de los archivos Markdown de la carpeta `docs/` del repositorio, que son la fuente de
verdad y se actualizan junto con el código. Si este PDF y el repositorio no coinciden, gana el repositorio: el
PDF se vuelve a generar con `docs/pdf/build.sh`. Los enlaces a archivos del código apuntan a la rama `main` en
GitHub.
