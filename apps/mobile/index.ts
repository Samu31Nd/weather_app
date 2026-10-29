// Punto de entrada: registra los widgets de Android (solo en el APK) y arranca Expo Router.

import 'expo-router/entry'
import { WIDGETS_AVAILABLE } from './src/widget/availability'

if (WIDGETS_AVAILABLE) {
  // Carga diferida: la librería de widgets falla al importarse donde no hay módulo nativo (Expo Go, iOS).
  const { registerWeatherWidgets } = require('./src/widget/register') as typeof import('./src/widget/register')
  registerWeatherWidgets()
}
