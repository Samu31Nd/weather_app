// Los widgets solo existen en Android y en una build propia (APK). Expo Go no trae el módulo nativo y la librería
// falla al importarse sin él, así que todo acceso a los widgets pasa por esta bandera y se carga bajo demanda.

import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Platform } from 'react-native'

export const WIDGETS_AVAILABLE = Platform.OS === 'android' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
