import { View, Text, useColorScheme } from 'react-native';
import { Wind } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';
import { compassPointFromDegrees } from '@tt/core';
import { WeatherEntity } from '../../core/domain/models/WeatherEntity';
import { useUnit, convertSpeed } from '../contexts/UnitContext';

interface WindWidgetProps {
  data: WeatherEntity;
}

export const WindWidget = ({ data }: WindWidgetProps) => {
  const { unitSystem } = useUnit();
  const colorScheme = useColorScheme(); const isDark = colorScheme !== 'light';
  const windRotation = useSharedValue(data.wind.direction || 0);

  useEffect(() => {
    const baseDir = data.wind.direction || 0;
    
    // Instead of a fake continuous loop, we simply animate smoothly to the new 
    // direction exactly when the new data arrives from the station.
    // We use a spring or slow timing to make the needle drift naturally to its new heading.
    windRotation.value = withTiming(baseDir, { 
      duration: 2000, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [data.wind.direction]);

  const animatedNeedleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${windRotation.value}deg` }]
  }));

  const windDirText = `${data.wind.direction || 0}° ${compassPointFromDegrees(data.wind.direction || 0)}`;
  const gustDirText = `${compassPointFromDegrees(data.wind.gustDirection || 0)} (${data.wind.gustDirection || 0}°)`;

  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph';
  const speed = convertSpeed(data.wind.speed, unitSystem);
  const gust = convertSpeed(data.wind.gust, unitSystem);

  return (
    <View className="relative w-full rounded-xl bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 p-5 overflow-hidden shadow-md shadow-black/10 dark:shadow-black/25 mb-8 mt-2">
      {/* Ambient Glow */}
      <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#0284c7]/10 dark:bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-2">
          <Wind size={18} color={isDark ? "#38bdf8" : "#0284c7"} />
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-wider" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            Wind Vector & Anemometer
          </Text>
        </View>
        <View className="px-2 py-1 rounded-full bg-[#e2e8f0]/80 dark:bg-[#262a35]/80">
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[10px] uppercase tracking-wide" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            {windDirText}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        
        {/* Left: Telemetry Stats */}
        <View className="flex-[0.6] flex-col gap-2">
          <View>
            <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              Sustained Speed
            </Text>
            <View className="flex-row items-baseline gap-1 mt-0.5">
              <Text className="text-[#0f172a] dark:text-[#dfe2f1] tracking-tight" style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 42, lineHeight: 48 }}>
                {speed?.toFixed(1) || '0.0'}
              </Text>
              <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[16px]" style={{ fontFamily: 'Inter_300Light' }}>
                {speedUnit}
              </Text>
            </View>
          </View>
          
          <View className="p-3 rounded-lg bg-[#e2e8f0]/50 dark:bg-[#262a35]/50 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 flex-col gap-1 mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[#ef4444] dark:text-[#ffb4ab] text-[10px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                Peak Gust
              </Text>
              <Text className="text-[#475569] dark:text-[#bdc8d1] text-[10px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                {gustDirText}
              </Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                {gust?.toFixed(1) || '0.0'}
              </Text>
              <Text className="text-[#475569] dark:text-[#bdc8d1] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>
                {speedUnit}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Compass Disc */}
        <View className="flex-[0.4] items-center justify-center">
          <View className="relative w-28 h-28 rounded-full bg-[#e2e8f0]/60 dark:bg-[#262a35]/60 flex items-center justify-center border border-black/30">
            {/* Cardinal Marks */}
            <Text className="absolute top-1 text-[#0284c7] dark:text-[#38bdf8] text-[9px] font-bold" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>N</Text>
            <Text className="absolute bottom-1 text-[#475569] dark:text-[#bdc8d1] text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>S</Text>
            <Text className="absolute left-2 text-[#475569] dark:text-[#bdc8d1] text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>W</Text>
            <Text className="absolute right-2 text-[#475569] dark:text-[#bdc8d1] text-[9px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>E</Text>
            
            {/* Inner Radar Rings */}
            <View className="w-16 h-16 rounded-full bg-[#f1f5f9]/60 dark:bg-[#1c1f2a]/60 flex items-center justify-center border border-[#cbd5e1]/30 dark:border-[#3e484f]/30">
              <View className="w-2 h-2 rounded-full bg-[#0284c7]/60 dark:bg-[#38bdf8]/60" />
            </View>

            {/* Dynamic Wind Needle */}
            <Animated.View 
              className="absolute w-full h-full items-center justify-center pointer-events-none"
              style={animatedNeedleStyle}
            >
              <View className="w-full flex-row items-center justify-between px-2.5">
                {/* Arrow Head */}
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
                <View className="w-1.5 h-1.5 rounded-full bg-[#64748b] dark:bg-[#87929a] opacity-80" />
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
};
