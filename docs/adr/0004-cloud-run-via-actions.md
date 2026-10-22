# ADR-0004 · Web en Cloud Run, desplegada desde GitHub Actions

- **Estado:** Aceptada (2026-10-21)

## Contexto
La web necesita un servidor por el proxy del dato en vivo. Se querían staging por PR bajo demanda (con un
comentario), producción separada, checks obligatorios y costo cercano a cero. Las alternativas eran Vercel (gratis
y simple, pero otra cuenta y otro proveedor) y Cloud Run en el proyecto GCP que ya existe.

## Decisión
- Cloud Run en `estacion-meteorologica-b033-2`, con dos servicios: `weather-web` y `weather-web-staging`. Escalan
  a cero.
- Cada PR tiene una revisión etiquetada `pr-N`, sin tráfico.
- Actions se autentica con **Workload Identity Federation**, sin llaves JSON.
- La infraestructura se define como Terraform en `proj-files/infra`.

## Consecuencias
- Todo el sistema queda en un solo proveedor y un solo proyecto, lo que es coherente con la tesis.
- Sin tráfico el costo es prácticamente 0. Artifact Registry necesita una política de limpieza.
- Hay más configuración inicial que con Vercel (WIF y cuentas de servicio).
