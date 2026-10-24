# Registro de decisiones (ADR)

Cada decisión de arquitectura tiene un archivo con su contexto, la decisión y sus consecuencias. Una decisión no
se borra: si cambia, se escribe un ADR nuevo que la **reemplaza** y se marca el viejo.

| ADR | Decisión | Estado |
|-----|----------|--------|
| [0001](0001-monorepo.md) | Un monorepo con núcleo compartido | Aceptada |
| [0002](0002-next-y-expo.md) | Next.js para web y Expo para móvil, en vez de solo Expo | Aceptada |
| [0003](0003-npm-workspaces.md) | npm workspaces en vez de pnpm | Aceptada |
| [0004](0004-cloud-run-via-actions.md) | Web en Cloud Run, desplegada desde GitHub Actions | Aceptada |
| [0005](0005-movil-ota-apk-al-final.md) | Móvil: staging y producción por OTA; APK a mano al final | Aceptada |
| [0006](0006-graficas-svg-propias.md) | Gráficas en SVG propio con geometría compartida | Aceptada |
| [0007](0007-proxy-dato-en-vivo.md) | Proxy para el dato en vivo, también para el móvil | Aceptada |
| [0008](0008-documentar-antes-de-codificar.md) | Especificación en `docs/` antes del código y antes del LaTeX | Aceptada |
| [0009](0009-arte-del-diseno-por-extraccion.md) | El arte del diseño se extrae del canvas con un script, no se copia a mano | Aceptada |
