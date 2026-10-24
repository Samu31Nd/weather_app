import {
  View,
  Pressable,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
import { Home, Calendar, Settings } from "lucide-react-native";

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

export const ResponsiveNavBar = ({ state, emitter, navigateToTab }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={`w-full flex-row items-center justify-center pointer-events-box-none ${isDesktop ? "absolute top-6" : "absolute bottom-8"}`}
      style={{ zIndex: 100 }}
    >
      <View className="flex-row items-center justify-between px-8 py-4 rounded-full bg-[#f1f5f9]/85 dark:bg-[#1d222c]/85 border border-[#cbd5e1]/40 dark:border-[#ffffff]/25 backdrop-blur-2xl saturate-200 w-[90%] max-w-md ">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = emitter.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          let Icon = Home;
          if (route.name === "calendar") Icon = Calendar;
          if (route.name === "config") Icon = Settings;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className={`items-center justify-center p-2 rounded-full transition-all duration-300 ${isFocused ? "bg-[#0284c7]/20 dark:bg-[#38bdf8]/20" : "bg-transparent"}`}
            >
              <Icon
                size={24}
                color={
                  isFocused
                    ? isDark
                      ? "#38bdf8"
                      : "#0284c7"
                    : isDark
                      ? "#87929a"
                      : "#64748b"
                }
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
