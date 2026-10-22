# ADR-0005 · Móvil: staging y producción por OTA; APK a mano al final

- **Estado:** Aceptada (2026-10-21)

## Contexto
EAS Build tiene un cupo mensual limitado en el plan gratuito. Mientras la app está en desarrollo, casi todos los
cambios son de JavaScript.

## Decisión
- **Staging:** `eas update --branch pr-N`, que se abre en Expo Go con un QR. No compila nada.
- **Producción:** `eas update --channel production`.
- El APK de producción se genera **a mano, al final**, cuando la app esté lista. No hay builds en el CI.
- El CI se autentica con el token de un *robot user* de la organización `samu31nds-team`.

## Consecuencias
- No se gasta el cupo de builds.
- Mientras no exista el APK, para probar la app hay que usar Expo Go. Por eso solo se usan módulos que Expo Go
  soporta, o se documenta la excepción.
