import { View, Text } from 'react-native';
import { Sun, Cloud, ArrowUp, ArrowDown } from 'lucide-react-native';
import { WeatherData } from '../../core/domain/models/WeatherData';

interface HeroWidgetProps {
  data: WeatherData;
}

export const HeroWidget = ({ data }: HeroWidgetProps) => {
  return (
    <View className="relative w-full rounded-2xl overflow-hidden mt-4">
      {/* Background layer for the card (surface-container/70) */}
      <View className="absolute inset-0 bg-[#1c1f2a]/70" style={{ backgroundColor: 'rgba(28, 31, 42, 0.7)' }} />
      
      {/* Ambient glow effect inside the card */}
      <View className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-primary/20 blur-[50px] opacity-70" />

      {/* Card Content */}
      <View className="p-6 relative z-10">
        
        {/* Top Bar: Condition Header & Art */}
        <View className="flex-row items-start justify-between">
          <View className="flex-col gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-primary text-[11px] tracking-wider uppercase" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                Outdoor Station
              </Text>
              <View className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/20">
                <Text className="text-primary text-[10px] font-bold tracking-wide uppercase">
                  Normal
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="text-white text-[18px] font-light" style={{ fontFamily: 'Inter_300Light' }}>
                {data.conditionText}
              </Text>
              <Text className="text-on-surface-variant text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>
                · Fair Sky
              </Text>
            </View>
          </View>

          {/* Vivid Layered Weather Art Badge */}
          <View className="w-16 h-16 rounded-2xl bg-primary/20 border border-white/10 items-center justify-center relative overflow-hidden">
             <View className="absolute inset-0 bg-amber-500/10" />
             {data.condition === 'sunny' ? (
               <Sun size={32} color="#F59E0B" fill="#FDE047" />
             ) : (
               <Cloud size={32} color="#38bdf8" fill="#BAE6FD" />
             )}
          </View>
        </View>

        {/* Big Display Temperature */}
        <View className="flex-row items-baseline mt-4 mb-4">
          <Text className="text-white tracking-tighter" style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 64, lineHeight: 72 }}>
            {data.temperature}
          </Text>
          <Text className="text-primary font-light ml-1" style={{ fontFamily: 'Inter_300Light', fontSize: 28 }}>
            °
          </Text>
        </View>

        {/* High / Low Diurnal Spread */}
        <View className="flex-row justify-between mt-2 space-x-3 gap-3">
          
          {/* Day High */}
          <View className="flex-1 flex-row items-center p-3 rounded-lg bg-[#262a35]/40 border border-white/5 gap-3">
            <View className="w-7 h-7 rounded-full bg-[#ffb4ab]/15 items-center justify-center shrink-0">
              <ArrowUp size={16} color="#ffb4ab" />
            </View>
            <View className="flex-col">
              <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                Day High
              </Text>
              <Text className="text-white text-[22px] mt-0.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                {data.highTemp}°
              </Text>
            </View>
          </View>

          {/* Night Low */}
          <View className="flex-1 flex-row items-center p-3 rounded-lg bg-[#262a35]/40 border border-white/5 gap-3">
            <View className="w-7 h-7 rounded-full bg-primary/15 items-center justify-center shrink-0">
              <ArrowDown size={16} color="#38bdf8" />
            </View>
            <View className="flex-col">
              <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                Night Low
              </Text>
              <Text className="text-white text-[22px] mt-0.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                {data.lowTemp}°
              </Text>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
};
