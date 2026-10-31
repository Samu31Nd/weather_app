# ADR-0011 · Widget de Android con react-native-android-widget

- **Estado:** Aceptada (2026-10-25)

## Contexto
Se quiere un widget en la pantalla de inicio con el clima de la estación, solo en el APK (Android). Las opciones
eran escribirlo en Kotlin con Glance o RemoteViews, o usar una librería que lo describa en JSX desde el mismo código
de la app. iOS queda fuera: necesita WidgetKit en Swift y una cuenta de desarrollador de pago.

## Decisión
- `react-native-android-widget` (config plugin de Expo): el widget se escribe con `FlexWidget`, `TextWidget` y
  `SvgWidget`, y un manejador en JS headless lo dibuja al agregarlo, cada 30 min (el mínimo de Android), al
  redimensionarlo y al tocar ↻. La app también lo redibuja cada vez que recibe un dato nuevo.
- Usa el mismo núcleo que la app (`createMobileCore`, preferencias de idioma y unidades). Lo propio del widget vive
  en los paquetes: reglas de ícono y dato contextual en `@tt/core` (`widgetKind`, `widgetDetail`), textos en
  `@tt/i18n` (`widgetText`), colores en `@tt/tokens` (`WIDGET_PALETTES`, con contraste AA) e íconos en
  `@tt/sky-art` (`widgetIconSvg`).
- Se entregan las versiones clara y oscura; Android elige según el tema del sistema. No se fija la fuente: el
  texto usa la del usuario y respeta su tamaño de letra.
- La librería falla al importarse sin su módulo nativo, así que solo se carga en Android fuera de Expo Go
  (`WIDGETS_AVAILABLE`), con `require` diferido.

## Consecuencias
- El widget solo se ve en el APK (`npm run build:android`); Expo Go y el staging por OTA no lo muestran.
- Agregar o cambiar widgets cambia el código nativo: requiere un APK nuevo, no basta una actualización OTA.
- Si la consola no responde, el widget muestra la última temperatura guardada en gris y su hora.
- La librería dibuja el widget desde un trabajo de WorkManager 2.8.1. En la build de release, R8 (modo completo)
  quitaba el constructor de `OverwritingInputMerger`, el trabajo fallaba y el widget quedaba transparente. La
  regla `-keepclassmembers class * extends androidx.work.InputMerger { public <init>(); }` se agrega con
  `expo-build-properties` en `app.json`.
- La librería llama a los componentes del widget como funciones simples. El React Compiler (activo en la app) les
  agrega hooks de memorización y el render fallaba con "Invalid Hook Call"; `weather-widget.tsx` lleva
  `'use no memo'` para excluirlo.
