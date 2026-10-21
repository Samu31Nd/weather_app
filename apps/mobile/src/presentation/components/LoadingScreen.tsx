import { useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeInDown,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

interface LoadingScreenProps {
  fontsLoaded: boolean;
}

export const LoadingScreen = ({ fontsLoaded }: LoadingScreenProps) => {
  // Subtle pulsing animation for the image
  const scale = useSharedValue(1);
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite repeat
      true, // reverse
    );
  }, []);

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-[#0b0f19] relative">
      {/* Deep atmospheric glow (Level 0 Canvas) */}
      <View
        style={StyleSheet.absoluteFill}
        className="opacity-50 pointer-events-none"
      >
        <View className="absolute -top-32 -left-32 w-[120%] h-[60%] bg-[#0284c7]/10 dark:bg-[#38bdf8]/10 rounded-full blur-[100px]" />
        <View className="absolute -bottom-32 -right-32 w-[100%] h-[60%] bg-[#0369a1]/10 dark:bg-[#c084fc]/10 rounded-full blur-[120px]" />
      </View>

      {/* 25% Text Container - Top */}
      <View className="flex-[0.25] justify-center items-center pt-12 relative z-10">
        <Animated.View
          entering={FadeInDown.duration(1200).delay(300)}
          className="items-center"
        >
          <Text
            className="text-[#0f172a] dark:text-[#dfe2f1] text-3xl text-center tracking-[0.2em] uppercase mb-4"
            style={{
              fontFamily: fontsLoaded ? "Inter_200ExtraLight" : undefined,
            }}
          >
            My Weather App
          </Text>

          <View className="h-px w-16 bg-gradient-to-r from-transparent via-[#0284c7]/50 dark:via-[#38bdf8]/50 to-transparent mb-4" />

          {/* Quick Status Pill instead of plain text */}
          <View className="flex-row items-center bg-[#e2e8f0]/60 dark:bg-[#262a35]/60 px-4 py-1.5 rounded-full border border-[#cbd5e1]/40 dark:border-[#3e484f]/40">
            <View className="relative w-2 h-2 mr-2 justify-center items-center">
              <Animated.View
                className="absolute w-2 h-2 rounded-full bg-[#0284c7] dark:bg-[#38bdf8]"
                style={useAnimatedStyle(() => ({
                  opacity: withRepeat(
                    withTiming(0, { duration: 1000 }),
                    -1,
                    false,
                  ),
                  transform: [
                    {
                      scale: withRepeat(
                        withTiming(2.5, { duration: 1000 }),
                        -1,
                        false,
                      ),
                    },
                  ],
                }))}
              />
              <View className="absolute w-2 h-2 rounded-full bg-[#0284c7] dark:bg-[#38bdf8]" />
            </View>
            <Text
              className="text-[#0284c7] dark:text-[#38bdf8] text-[10px] tracking-[0.15em] uppercase"
              style={{
                fontFamily: fontsLoaded
                  ? "SpaceGrotesk_600SemiBold"
                  : undefined,
              }}
            >
              Initializing Telemetry
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* 75% Image Container - Bottom Pinned */}
      <View className="flex-[0.75] w-full items-center justify-end relative z-10">
        <Animated.View
          entering={FadeIn.duration(1500)}
          style={[{ width: "100%", height: "100%" }, animatedImageStyle]}
        >
          <Image
            source={require("../../../assets/images/StationRender.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            contentPosition="bottom center"
            transition={1000}
          />
        </Animated.View>
      </View>
    </View>
  );
};
