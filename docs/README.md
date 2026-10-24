# Documentación técnica de la app

Especificación de la app web y móvil de la Estación meteorológica TT 2026-B033. Va primero: el código de cada
fase se escribe a partir de esto y cita sus IDs (`RF-APP-NN`, `RNF-APP-NN`, `CU-NN`).

Aquí está completa. La tesis (`documentTT`) tomará después una versión resumida, porque su tema principal es el
procesamiento de los datos; lo que no entre en el cuerpo irá a anexos.

| Documento | Para qué |
|-----------|----------|
| [00 · Visión](00-vision.md) | El porqué: problema, objetivos, alcance y actores |
| [01 · Requerimientos](01-requerimientos.md) | RF y RNF con criterio de aceptación y trazabilidad a la tesis |
| [02 · Casos de uso](02-casos-de-uso.md) | Qué hace cada actor y cómo responde el sistema |
| [03 · Arquitectura](03-arquitectura.md) | Contexto, contenedores y componentes (hexagonal) |
| [04 · Modelo de dominio](04-modelo-dominio.md) | Entidades, value objects, puertos y casos de uso |
| [05 · Flujos](05-flujos.md) | Secuencias principales y estados de pantalla |
| [06 · Datos](06-datos.md) | Diccionario de datos, rarezas y regla de la escena del cielo |
| [07 · Interfaz](07-interfaz.md) | Pantallas, navegación, preferencias y accesibilidad |
| [08 · Calidad y pruebas](08-calidad-pruebas.md) | Estrategia de pruebas y matriz de trazabilidad |
| [09 · Despliegue](09-despliegue.md) | *Anexo operativo:* entornos, CI/CD, costos y rollback |
| [10 · Notas para la tesis](10-notas-tesis.md) | Qué cambia en los caps. 6 y 7 de `documentTT` y de dónde sale el texto |
| [diagramas/](diagramas/) | Diagrama UML de casos de uso en PlantUML, exportable para la tesis |
| [adr/](adr/) | Registro de decisiones de arquitectura |

## Convenciones

- Los diagramas son Mermaid y GitHub los muestra tal cual.
- Los IDs no se reutilizan: si un requerimiento se descarta, se marca como **Retirado** y conserva su número.
- La tesis (cap. 3 y cap. 6) es la base, pero **no la fuente de verdad**: solo contempla la web y está
  desactualizada. Donde haya contradicción, gana este directorio. Las diferencias se anotan para actualizar
  después el cap. 6.
- Para los datos, la fuente de verdad es el sistema desplegado (`proj-files`).
