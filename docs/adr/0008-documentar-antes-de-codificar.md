# ADR-0008 · Especificación en `docs/` antes del código y antes del LaTeX

- **Estado:** Aceptada (2026-10-21)

## Contexto
Los requerimientos de la tesis (cap. 6) solo contemplan la web y están desactualizados. Se iba a reescribir mucho
código sin una especificación que diera el porqué de cada parte.

## Decisión
- Antes de las fases de código se escribe la especificación en `docs/`, en Markdown y con diagramas Mermaid:
  visión, requerimientos, casos de uso, arquitectura, dominio, flujos, datos, interfaz, pruebas, despliegue y ADR.
- El código, los PR y los tests citan sus IDs.
- Al final, la tesis toma una versión resumida (cuerpo y anexos), porque su tema principal es el procesamiento de
  datos.

## Consecuencias
- Cada componente y cada test se rastrean hasta un requerimiento (matriz en `08-calidad-pruebas.md`).
- La especificación se actualiza en el mismo PR que la cambia.
