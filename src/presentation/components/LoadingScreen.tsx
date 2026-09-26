import { useEffect } from "react";
import { Text, View } from "react-native";
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
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite repeat
      true, // reverse
    );
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* 25% Text Container - Top */}
      <View className="flex-[0.25] justify-center items-center pt-12">
        <Animated.View
          entering={FadeInDown.duration(1200).delay(800)}
          className="items-center"
        >
          <Text
            className="text-white text-3xl text-center tracking-widest uppercase mb-4"
            style={{
              fontFamily: fontsLoaded ? "SpaceGrotesk_700Bold" : undefined,
            }}
          >
            My Weather
          </Text>

          <View className="h-px w-12 bg-white mb-4 opacity-50" />

          <Text
            className="text-gray-400 text-xs tracking-[0.3em] uppercase"
            style={{
              fontFamily: fontsLoaded ? "SpaceGrotesk_400Regular" : undefined,
            }}
          >
            Loading app, please be patient
          </Text>
        </Animated.View>
      </View>

      {/* 75% Image Container - Bottom Pinned */}
      <View className="flex-[0.75] w-full items-center justify-end">
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
