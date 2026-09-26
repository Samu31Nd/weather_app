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
    <View className="flex-1 bg-[#0b0f19] relative">
      {/* Deep atmospheric glow (Level 0 Canvas) */}
      <View style={StyleSheet.absoluteFill} className="opacity-50 pointer-events-none">
        <View className="absolute -top-32 -left-32 w-[120%] h-[60%] bg-primary/10 rounded-full blur-[100px]" />
        <View className="absolute -bottom-32 -right-32 w-[100%] h-[60%] bg-tertiary/10 rounded-full blur-[120px]" />
      </View>

      {/* 25% Text Container - Top */}
      <View className="flex-[0.25] justify-center items-center pt-12 relative z-10">
        <Animated.View
          entering={FadeInDown.duration(1200).delay(300)}
          className="items-center"
        >
          <Text
            className="text-white text-3xl text-center tracking-[0.2em] uppercase mb-4"
            style={{
              fontFamily: fontsLoaded ? "Inter_200ExtraLight" : undefined,
            }}
          >
            Aether
          </Text>

          <View className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-4" />

          {/* Quick Status Pill instead of plain text */}
          <View className="flex-row items-center bg-[#262a35]/60 px-4 py-1.5 rounded-full border border-white/10">
            <View className="relative w-2 h-2 mr-2 justify-center items-center">
              <Animated.View 
                className="absolute w-2 h-2 rounded-full bg-primary" 
                style={useAnimatedStyle(() => ({
                  opacity: withRepeat(withTiming(0, {duration: 1000}), -1, false),
                  transform: [{scale: withRepeat(withTiming(2.5, {duration: 1000}), -1, false)}]
                }))}
              />
              <View className="absolute w-2 h-2 rounded-full bg-primary" />
            </View>
            <Text
              className="text-primary text-[10px] tracking-[0.15em] uppercase"
              style={{
                fontFamily: fontsLoaded ? "SpaceGrotesk_600SemiBold" : undefined,
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
