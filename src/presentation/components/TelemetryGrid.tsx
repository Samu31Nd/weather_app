import { View, Text, useColorScheme } from 'react-native';
import { Home, Droplets, Gauge, TrendingUp, CloudRain, TrendingDown } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WeatherEntity } from '../../core/domain/models/WeatherEntity';
import { useUnit, convertTemp, convertPressure, convertLength } from '../contexts/UnitContext';

interface TelemetryGridProps {
  data: WeatherEntity;
}

export const TelemetryGrid = ({ data }: TelemetryGridProps) => {
  const { unitSystem } = useUnit();
  const colorScheme = useColorScheme(); const isDark = colorScheme !== 'light';

  const indoorTemp = convertTemp(data.indoor.temperature, unitSystem) || 0;
  const indoorHum = data.indoor.humidity || 0;
  const outHum = data.outdoor.humidity || 0;
  const dewPt = convertTemp(data.outdoor.dewPoint, unitSystem) || 0;
  const pressure = convertPressure(data.barometer.pressure, unitSystem) || 0;
  const trend = convertPressure(data.barometer.trend, unitSystem) || 0;
  const rain = convertLength(data.rain.daily, unitSystem) || 0;
  const rainRate = convertLength(data.rain.rate, unitSystem) || 0;
  
  const isTrendingUp = trend > 0;
  const tempUnit = unitSystem === 'metric' ? '°C' : '°F';
  const pressUnit = unitSystem === 'metric' ? 'hPa' : 'inHg';
  const rainUnit = unitSystem === 'metric' ? 'mm' : 'in';

  return (
    <View className="flex-row flex-wrap justify-between w-full mt-2 mb-8 gap-y-3">
      
      {/* Indoor Module Card */}
      <View className="w-[48%] relative flex-col justify-between p-3.5 rounded-xl bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 overflow-hidden shadow-md shadow-black/10 dark:shadow-black/25">
        <View className="absolute -right-6 -bottom-6 w-20 h-20 bg-secondary/20 rounded-full blur-xl pointer-events-none" />
        
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Indoor</Text>
          <Home size={16} color={isDark ? "#818cf8" : "#0ea5e9"} />
        </View>
        
        <View className="flex-col gap-0.5 mb-4">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>{indoorTemp.toFixed(1)}</Text>
            <Text className="text-[#0ea5e9] dark:text-[#818cf8] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>{tempUnit}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Droplets size={12} color="#bdc8d1" />
            <Text className="text-[#475569] dark:text-[#bdc8d1] text-[14px] ml-1" style={{ fontFamily: 'Inter_400Regular' }}>{indoorHum}%</Text>
            <Text className="text-[#0284c7]/80 dark:text-[#38bdf8]/80 text-[11px] tracking-widest ml-auto" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              {indoorHum > 40 && indoorHum < 60 ? 'IDEAL' : 'WARN'}
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="w-full bg-[#cbd5e1]/60 dark:bg-[#313540]/60 rounded-full h-1 overflow-hidden mt-auto">
          <View className="bg-secondary h-1 rounded-full" style={{ width: `${Math.min(indoorHum, 100)}%` }} />
        </View>
      </View>

      {/* Outdoor Atmospheric Moisture Card */}
      <View className="w-[48%] relative flex-col justify-between p-3.5 rounded-xl bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 overflow-hidden shadow-md shadow-black/10 dark:shadow-black/25">
        <View className="absolute -right-6 -top-6 w-20 h-20 bg-[#0284c7]/20 dark:bg-[#38bdf8]/20 rounded-full blur-xl pointer-events-none" />
        
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Humidity</Text>
          <Droplets size={16} color={isDark ? "#38bdf8" : "#0284c7"} />
        </View>
        
        <View className="flex-col gap-0.5 mb-4">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>{outHum}</Text>
            <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>%</Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-[#475569] dark:text-[#bdc8d1] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>Dew Pt</Text>
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[14px]" style={{ fontFamily: 'Inter_400Regular' }}>{dewPt.toFixed(1)}°</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="w-full bg-[#cbd5e1]/60 dark:bg-[#313540]/60 rounded-full h-1 overflow-hidden mt-auto">
          <View className="bg-[#0284c7] dark:bg-[#38bdf8] h-1 rounded-full" style={{ width: `${Math.min(outHum, 100)}%` }} />
        </View>
      </View>

      {/* Barometer Card */}
      <View className="w-[48%] relative flex-col justify-between p-3.5 rounded-xl bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 overflow-hidden shadow-md shadow-black/10 dark:shadow-black/25">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Barometer</Text>
          <Gauge size={16} color={isDark ? "#c084fc" : "#0369a1"} />
        </View>
        
        <View className="flex-col gap-0.5 mb-3">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              {pressure.toFixed(unitSystem === 'metric' ? 1 : 2)}
            </Text>
            <Text className="text-[#0369a1] dark:text-[#c084fc] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>{pressUnit}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            {isTrendingUp ? (
              <TrendingUp size={12} color={isDark ? "#38bdf8" : "#0284c7"} />
            ) : (
              <TrendingDown size={12} color={isDark ? "#ffb4ab" : "#ef4444"} />
            )}
            <Text className="text-[#475569] dark:text-[#bdc8d1] text-[10px] tracking-tight ml-1 uppercase" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              {trend > 0 ? '+' : ''}{trend.toFixed(unitSystem === 'metric' ? 1 : 2)} past 3h
            </Text>
          </View>
        </View>
        
        {/* SVG Sparkline */}
        <View className="w-full pt-1 mt-auto">
          <Svg width="100%" height={24} viewBox="0 0 100 24">
            <Defs>
              <LinearGradient id="baroGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={isDark ? '#38bdf8' : '#0284c7'} stopOpacity={0.3} />
                <Stop offset="100%" stopColor={isDark ? '#38bdf8' : '#0284c7'} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {(() => {
              // Mathematical dynamic bezier curve based on the 3h trend
              // We normalize trend assuming max fluctuation is around 60 (or 2.0 in hPa)
              // We map it so trend=0 is flat, trend>0 curves up, trend<0 curves down
              const maxTrend = unitSystem === 'metric' ? 2.0 : 60; 
              const normalizedTrend = Math.max(-1, Math.min(1, trend / maxTrend)); 
              
              // Map to Y coordinates (0 is top, 24 is bottom)
              // Current value (right side, x=100)
              const endY = 12 - (normalizedTrend * 8); 
              // 3 hours ago (left side, x=0)
              const startY = 12 + (normalizedTrend * 8);
              // Control points for a smooth bezier curve
              const cp1X = 25, cp1Y = startY;
              const cp2X = 50, cp2Y = endY;

              const pathStr = `M 0 ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, 100 ${endY}`;
              const fillPathStr = `${pathStr} L 100 24 L 0 24 Z`;

              return (
                <>
                  <Path d={pathStr} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.8} className="text-[#0284c7] dark:text-[#38bdf8]" />
                  <Path d={fillPathStr} fill="url(#baroGrad)" />
                  <Circle cx={100} cy={endY} fill="currentColor" r={2.5} className="text-[#0284c7] dark:text-[#38bdf8]" />
                </>
              );
            })()}
          </Svg>
        </View>
      </View>

      {/* Rainfall Card */}
      <View className="w-[48%] relative flex-col justify-between p-3.5 rounded-xl bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 overflow-hidden shadow-md shadow-black/10 dark:shadow-black/25">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Rainfall</Text>
          <CloudRain size={16} color={isDark ? "#38bdf8" : "#0284c7"} />
        </View>
        
        <View className="flex-col gap-0.5 mb-5">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px]" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
              {rain.toFixed(unitSystem === 'metric' ? 1 : 2)}
            </Text>
            <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>{rainUnit}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-[#475569] dark:text-[#bdc8d1] text-[12px]" style={{ fontFamily: 'Inter_400Regular' }}>Rate</Text>
            <Text className="text-[#0f172a] dark:text-[#dfe2f1] text-[14px]" style={{ fontFamily: 'Inter_400Regular' }}>
              {rainRate.toFixed(unitSystem === 'metric' ? 1 : 2)} {rainUnit}/h
            </Text>
          </View>
        </View>
        
        {/* Segmented Precipitation Bar */}
        <View className="flex-row items-center gap-1 w-full mt-auto">
          <View className={`h-1.5 flex-1 rounded-full ${rain > 0 ? 'bg-[#0284c7] dark:bg-[#38bdf8]' : 'bg-[#cbd5e1] dark:bg-[#313540]'}`} />
          <View className={`h-1.5 flex-1 rounded-full ${rain > (unitSystem === 'metric' ? 12 : 0.5) ? 'bg-[#0284c7]/70 dark:bg-[#38bdf8]/70' : 'bg-[#cbd5e1] dark:bg-[#313540]'}`} />
          <View className={`h-1.5 flex-1 rounded-full ${rain > (unitSystem === 'metric' ? 25 : 1) ? 'bg-[#0284c7]/40 dark:bg-[#38bdf8]/40' : 'bg-[#cbd5e1] dark:bg-[#313540]'}`} />
          <View className={`h-1.5 flex-1 rounded-full ${rain > (unitSystem === 'metric' ? 50 : 2) ? 'bg-[#0284c7]/20 dark:bg-[#38bdf8]/20' : 'bg-[#cbd5e1] dark:bg-[#313540]'}`} />
        </View>
      </View>

    </View>
  );
};
