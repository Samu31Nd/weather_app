import { Tabs } from 'expo-router';
import { ResponsiveNavBar } from '../../presentation/components/ResponsiveNavBar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MainLayout() {
  return (
    <View className="flex-1 bg-background relative">
      {/* Dynamic atmospheric viewport background (Level 0) */}
      <View style={StyleSheet.absoluteFill} className="opacity-40">
        <View className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" />
        <View className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-tertiary/20 rounded-full blur-[120px]" />
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' }, // allows the background to show through
        }}
        tabBar={(props) => <ResponsiveNavBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="config" />
      </Tabs>
    </View>
  );
}
