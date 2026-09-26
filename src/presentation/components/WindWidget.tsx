import { View, Text } from 'react-native';
import { Wind } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';

export const WindWidget = () => {
  // Mock animated wind fluctuation
  const windRotation = useSharedValue(295);

  useEffect(() => {
    windRotation.value = withRepeat(
      withSequence(
        withTiming(305, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(285, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(295, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedNeedleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${windRotation.value}deg` }]
  }));

  return (
    <View className="relative w-full rounded-xl bg-[#1c1f2a]/70 border border-white/5 p-5 overflow-hidden shadow-xl shadow-black/50 mb-8 mt-2">
      {/* Ambient Glow */}
      <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-2">
          <Wind size={18} color="#38bdf8" />
          <Text className="text-on-surface-variant text-[11px] uppercase tracking-wider" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            Wind Vector & Anemometer
          </Text>
        </View>
        <View className="px-2 py-1 rounded-full bg-[#262a35]/80">
          <Text className="text-primary text-[10px] uppercase tracking-wide" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            295° WNW
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        
        {/* Left: Telemetry Stats */}
        <View className="flex-[0.6] flex-col gap-2">
          <View>
            <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              Sustained Speed
            </Text>
            <View className="flex-row items-baseline gap-1 mt-0.5">
              <Text className="text-white tracking-tight" style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 42, lineHeight: 48 }}>
                18.5
              </Text>
              <Text className="text-primary text-[16px]" style={{ fontFamily: 'Inter_300Light' }}>
                km/h
              </Text>
            </View>
          </View>
          
          <View className="p-3 rounded-lg bg-[#262a35]/50 border border-white/5 flex-col gap-1 mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[#ffb4ab] text-[10px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                Peak Gust
              </Text>
              <Text className="text-on-surface-variant text-[10px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                NW (315°)
              </Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-white text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                28.4
              </Text>
              <Text className="text-on-surface-variant text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>
                km/h
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Compass Disc */}
        <View className="flex-[0.4] items-center justify-center">
          <View className="relative w-28 h-28 rounded-full bg-[#262a35]/60 flex items-center justify-center border border-black/30">
            {/* Cardinal Marks */}
            <Text className="absolute top-1 text-primary text-[9px] font-bold" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>N</Text>
            <Text className="absolute bottom-1 text-on-surface-variant text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>S</Text>
            <Text className="absolute left-2 text-on-surface-variant text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>W</Text>
            <Text className="absolute right-2 text-on-surface-variant text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>E</Text>
            
            {/* Inner Radar Rings */}
            <View className="w-16 h-16 rounded-full bg-[#1c1f2a]/60 flex items-center justify-center border border-white/5">
              <View className="w-2 h-2 rounded-full bg-primary/60" />
            </View>

            {/* Dynamic Wind Needle */}
            <Animated.View 
              className="absolute w-full h-full items-center justify-center pointer-events-none"
              style={animatedNeedleStyle}
            >
              <View className="w-full flex-row items-center justify-between px-2.5">
                {/* Arrow Head (CSS Triangle pointing left because rotation pushes it) */}
                <View 
                  style={{
                    width: 0,
                    height: 0,
                    borderTopWidth: 5,
                    borderBottomWidth: 5,
                    borderRightWidth: 10,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderRightColor: '#38bdf8',
                  }} 
                />
                {/* Counter Weight */}
                <View className="w-1.5 h-1.5 rounded-full bg-[#87929a] opacity-80" />
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
};
