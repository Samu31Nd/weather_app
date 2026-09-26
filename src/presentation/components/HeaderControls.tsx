import { View, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { useUnit } from "../contexts/UnitContext";

interface HeaderControlsProps {
  lastFetched?: Date | null;
}

export const HeaderControls = ({ lastFetched }: HeaderControlsProps) => {
  const { unitSystem, setUnitSystem } = useUnit();
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
      <View className="flex-row items-center bg-[#262a35]/60 px-4 py-1.5 rounded-full border-t border-white/10">
        <View className="relative w-2 h-2 mr-2 justify-center items-center">
          <Animated.View
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={animatedPingStyle}
          />
          <View className="absolute w-2 h-2 rounded-full bg-primary" />
        </View>

        <Text
          className="text-primary text-[11px] tracking-widest uppercase"
          style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
        >
          Live Sync
        </Text>

        <Text
          className="text-on-surface-variant/80 text-[12px] ml-2"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          {timeAgo}
        </Text>
      </View>

      {/* Unit Selector Pebble: Metric / Imperial */}
      <View className="flex-row items-center p-1 bg-[#262a35]/60 rounded-full border-t border-white/5 relative">
        {/* Animated Sliding Background Thumb */}
        <Animated.View
          className="absolute top-1 bottom-1 w-[72px] bg-primary rounded-full left-1"
          style={animatedThumbStyle}
        />

        <Pressable
          onPress={() => setUnitSystem("metric")}
          className="w-[72px] py-1 rounded-full items-center justify-center z-10"
        >
          <Animated.Text
            className={`text-[11px] tracking-widest uppercase ${unitSystem === "metric" ? "text-[#00354a]" : "text-on-surface-variant"}`}
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
            className={`text-[11px] tracking-widest uppercase ${unitSystem === "imperial" ? "text-[#00354a]" : "text-on-surface-variant"}`}
            style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
          >
            US/IMP
          </Animated.Text>
        </Pressable>
      </View>
    </View>
  );
};
