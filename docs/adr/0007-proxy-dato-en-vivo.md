# ADR-0007 · Proxy para el dato en vivo, también para el móvil

- **Estado:** Aceptada (2026-10-21)

## Contexto
La consola Davis solo sirve HTTP, sin cabeceras CORS, desde una IP del IPN. Un navegador servido por HTTPS no
puede llamarla. En móvil sí se podría llamar directo, pero para eso hay que permitir tráfico *cleartext* en Android
e iOS y exponer la IP en el bundle.

## Decisión
- Un route handler `/api/live` en la app web consulta la consola desde el servidor:
  - host fijo por variable de entorno;
  - timeout de 8 s;
  - caché de unos 10 s;
  - no reenvía las cabeceras del cliente.
- El móvil usa ese mismo proxy por defecto. La conexión directa queda como opción de desarrollo por variable de
  entorno.

## Consecuencias
- Hay HTTPS de punta a punta para el cliente, la IP de la consola no queda expuesta y no hay excepciones de
  *cleartext* en producción.
- Si Cloud Run se cae, el móvil también pierde el dato en vivo. Se acepta: hay un estado "sin conexión" y el SLA
  de Cloud Run es alto.
- La caché evita que muchos usuarios a la vez saturen la consola.
