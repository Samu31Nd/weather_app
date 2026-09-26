import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, Easing, withRepeat } from 'react-native-reanimated';

export const HeaderControls = () => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Pulsing dot animation for "Live Sync"
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedPingStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.75,
    transform: [{ scale: 1 + (1 - pulse.value) * 1.5 }]
  }));

  // Sliding thumb animation for Unit Selector
  const thumbPosition = useSharedValue(0);
  useEffect(() => {
    // 0 is the left position (METRIC), 72 is the right position (US/IMP)
    thumbPosition.value = withTiming(unit === 'metric' ? 0 : 72, { 
      duration: 350, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [unit]);

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }]
  }));

  return (
    <View className="flex-row items-center justify-between w-full pb-4">
      {/* Quick Status Pill & Station Metadata */}
      <View className="flex-row items-center bg-[#262a35]/60 px-4 py-1.5 rounded-full border-t border-white/10">
        <View className="relative w-2 h-2 mr-2 justify-center items-center">
          <Animated.View className="absolute w-2 h-2 rounded-full bg-primary" style={animatedPingStyle} />
          <View className="absolute w-2 h-2 rounded-full bg-primary" />
        </View>
        
        <Text className="text-primary text-[11px] tracking-widest uppercase" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
          Live Sync
        </Text>
        
        <Text className="text-on-surface-variant/80 text-[12px] ml-2" style={{ fontFamily: 'Inter_400Regular' }}>
          0.4s ago
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
          onPress={() => setUnit('metric')}
          className="w-[72px] py-1 rounded-full items-center justify-center z-10"
        >
          <Animated.Text 
            className={`text-[11px] tracking-widest uppercase ${unit === 'metric' ? 'text-[#00354a]' : 'text-on-surface-variant'}`} 
            style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}
          >
            METRIC
          </Animated.Text>
        </Pressable>
        
        <Pressable 
          onPress={() => setUnit('imperial')}
          className="w-[72px] py-1 rounded-full items-center justify-center z-10"
        >
          <Animated.Text 
            className={`text-[11px] tracking-widest uppercase ${unit === 'imperial' ? 'text-[#00354a]' : 'text-on-surface-variant'}`} 
            style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}
          >
            US/IMP
          </Animated.Text>
        </Pressable>
      </View>
    </View>
  );
};
