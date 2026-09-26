import { View, Pressable, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Settings } from 'lucide-react-native';

export const ResponsiveNavBar = ({ state, navigation }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View className={`w-full flex-row items-center justify-center pointer-events-box-none ${isDesktop ? 'absolute top-6' : 'absolute bottom-8'}`} style={{ zIndex: 100 }}>
      <View className="flex-row items-center justify-between px-8 py-4 rounded-full glass-level-2 w-[90%] max-w-md shadow-2xl shadow-black">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let Icon = Home;
          if (route.name === 'calendar') Icon = Calendar;
          if (route.name === 'config') Icon = Settings;

          return (
            <Pressable 
              key={route.key} 
              onPress={onPress} 
              className={`items-center justify-center p-2 rounded-full transition-all duration-300 ${isFocused ? 'bg-primary/20' : 'bg-transparent'}`}
            >
              <Icon size={24} color={isFocused ? '#38bdf8' : '#87929a'} strokeWidth={isFocused ? 2.5 : 2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
