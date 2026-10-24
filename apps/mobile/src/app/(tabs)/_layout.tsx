// Pestañas del artboard `MobileNow`: "Ahora" e "Histórico", con la barra inferior del diseño.

import { Tabs } from 'expo-router'
import { TabBar } from '@/components/shell/tab-bar'
import { usePreferences } from '@/providers/app-providers'

export default function TabsLayout() {
  const { palette } = usePreferences()
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.bg } }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="historico" />
    </Tabs>
  )
}
