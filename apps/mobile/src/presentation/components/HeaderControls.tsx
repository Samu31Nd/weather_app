import { View, Text, Pressable, useColorScheme, Appearance, Platform } from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { useUnit } from "../contexts/UnitContext";
import { Sun, Moon } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeaderControlsProps {
  lastFetched?: Date | null;
}

export const HeaderControls = ({ lastFetched }: HeaderControlsProps) => {
  const { unitSystem, setUnitSystem } = useUnit();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const toggleColorScheme = async () => {
    try {
      if (Platform.OS === 'web') {
        alert("Manual theme toggle is not supported on web. Please use your OS or Browser theme settings.");
        return;
      }
      const newTheme = isDark ? 'light' : 'dark';
      Appearance.setColorScheme(newTheme);
      await AsyncStorage.setItem('@app_theme', newTheme);
    } catch (e) {
      console.warn("Theme toggle failed:", e);
    }
  };
  
  const [timeAgo, setTimeAgo] = useState("syncing...");

  useEffect(() => {
    if (!lastFetched) return;

    const updateTime = () => {
      const seconds = Math.floor(
        (new Date().getTime() - lastFetched.getTime()) / 1000,
      );
      if (seconds < 1) setTimeAgo("just now");
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastFetched]);

  // Pulsing dot animation for "Live Sync"
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const animatedPingStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.75,
    transform: [{ scale: 1 + (1 - pulse.value) * 1.5 }],
  }));

  // Sliding thumb animation for Unit Selector
  const thumbPosition = useSharedValue(unitSystem === "metric" ? 0 : 72);

  useEffect(() => {
    // 0 is the left position (METRIC), 72 is the right position (US/IMP)
    thumbPosition.value = withTiming(unitSystem === "metric" ? 0 : 72, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [unitSystem]);

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }],
  }));

  return (
    <View className="flex-row items-center justify-between w-full pb-4">
      {/* Quick Status Pill & Station Metadata */}
      <View className="flex-row items-center bg-[#e2e8f0]/60 dark:bg-[#262a35]/60 px-4 py-1.5 rounded-full border-t border-[#cbd5e1]/40 dark:border-[#3e484f]/40">
        <View className="relative w-2 h-2 mr-2 justify-center items-center">
          <Animated.View
            className="absolute w-2 h-2 rounded-full bg-[#0284c7] dark:bg-[#38bdf8]"
            style={animatedPingStyle}
          />
          <View className="absolute w-2 h-2 rounded-full bg-[#0284c7] dark:bg-[#38bdf8]" />
        </View>

        <Text
          className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] tracking-widest uppercase"
          style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
        >
          Live Sync
        </Text>

        <Text
          className="text-[#475569]/80 dark:text-[#bdc8d1]/80 text-[12px] ml-2"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          {timeAgo}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Theme Toggle */}
        <Pressable 
          onPress={toggleColorScheme}
          className="w-8 h-8 rounded-full bg-[#e2e8f0]/60 dark:bg-[#262a35]/60 border-t border-[#cbd5e1]/40 dark:border-[#3e484f]/40 items-center justify-center"
        >
          {isDark ? <Sun size={14} color="#87929a" /> : <Moon size={14} color="#64748b" />}
        </Pressable>

        {/* Unit Selector Pebble: Metric / Imperial */}
        <View className="flex-row items-center p-1 bg-[#e2e8f0]/60 dark:bg-[#262a35]/60 rounded-full border-t border-[#cbd5e1]/30 dark:border-[#3e484f]/30 relative">
          {/* Animated Sliding Background Thumb */}
          <Animated.View
            className="absolute top-1 bottom-1 w-[72px] bg-[#0284c7] dark:bg-[#38bdf8] rounded-full left-1"
            style={animatedThumbStyle}
          />

          <Pressable
            onPress={() => setUnitSystem("metric")}
            className="w-[72px] py-1 rounded-full items-center justify-center z-10"
          >
            <Animated.Text
              className={`text-[11px] tracking-widest uppercase ${unitSystem === "metric" ? "text-white dark:text-[#00354a]" : "text-[#475569] dark:text-[#bdc8d1]"}`}
              style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
            >
              METRIC
            </Animated.Text>
          </Pressable>

          <Pressable
            onPress={() => setUnitSystem("imperial")}
            className="w-[72px] py-1 rounded-full items-center justify-center z-10"
          >
            <Animated.Text
              className={`text-[11px] tracking-widest uppercase ${unitSystem === "imperial" ? "text-white dark:text-[#00354a]" : "text-[#475569] dark:text-[#bdc8d1]"}`}
              style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
            >
              US/IMP
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
