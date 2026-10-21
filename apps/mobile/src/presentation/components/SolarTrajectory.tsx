import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useState } from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, RadialGradient, Line, Text as SvgText } from 'react-native-svg';
import { Sun, Clock, ChevronDown, ChevronRight, Sunrise, Sunset } from 'lucide-react-native';
import { WeatherEntity } from '../../core/domain/models/WeatherEntity';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface SolarTrajectoryProps {
  data: WeatherEntity;
}

// Helper to convert "7:27" or "19:31" to minutes since midnight
const parseTimeToMinutes = (timeStr: string) => {
  if (!timeStr || timeStr === '--:--') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
};

// Helper to format minutes back to AM/PM string
const formatTimeAMPM = (timeStr: string) => {
  if (!timeStr || timeStr === '--:--') return '--:--';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mins = m < 10 ? `0${m}` : m;
  return `${h12}:${mins} ${ampm}`;
};

export const SolarTrajectory = ({ data }: SolarTrajectoryProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  
  const [expanded, setExpanded] = useState(false);
  
  const sunriseStr = data.astronomy.sunrise;
  const sunsetStr = data.astronomy.sunset;
  
  const riseMins = parseTimeToMinutes(sunriseStr);
  const setMins = parseTimeToMinutes(sunsetStr);
  const currentMins = (new Date().getHours() * 60) + new Date().getMinutes();
  
  let progress = 0;
  let timeLeft = '';
  let isDayTime = false;
  
  if (riseMins > 0 && setMins > 0) {
    if (currentMins < riseMins) {
      progress = 0;
      timeLeft = 'Before dawn';
    } else if (currentMins > setMins) {
      progress = 1;
      timeLeft = 'Night time';
    } else {
      isDayTime = true;
      progress = (currentMins - riseMins) / (setMins - riseMins);
      const remaining = setMins - currentMins;
      const hLeft = Math.floor(remaining / 60);
      const mLeft = remaining % 60;
      timeLeft = `${hLeft}h ${mLeft}m left`;
    }
  }

  // Animation style for expanding/collapsing
  const animatedBodyStyle = useAnimatedStyle(() => ({
    height: withTiming(expanded ? 120 : 0, { duration: 300, easing: Easing.out(Easing.cubic) }),
    opacity: withTiming(expanded ? 1 : 0, { duration: 250 }),
    overflow: 'hidden'
  }));

  const animatedChevStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(expanded ? '0deg' : '-90deg', { duration: 200 }) }]
  }));

  // Math for the sun arc
  // Canvas width: 280, height: 56. Left margin: 20, Right margin: 260
  // Arc control points: M 20 48 C 60 12, 220 12, 260 48
  // Bezier formula to find (x,y) at t (progress)
  const getBezierPoint = (t: number) => {
    const p0 = { x: 20, y: 48 };
    const p1 = { x: 60, y: 12 };
    const p2 = { x: 220, y: 12 };
    const p3 = { x: 260, y: 48 };

    const cX = 3 * (p1.x - p0.x);
    const bX = 3 * (p2.x - p1.x) - cX;
    const aX = p3.x - p0.x - cX - bX;

    const cY = 3 * (p1.y - p0.y);
    const bY = 3 * (p2.y - p1.y) - cY;
    const aY = p3.y - p0.y - cY - bY;

    const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

    return { x, y };
  };

  // We only draw the filled path up to the current progress
  // A simple approximation for the partial path is another bezier or just an elliptical arc.
  // For SVG paths, creating a sub-bezier curve requires math, so we'll just draw a line or use `strokeDasharray` trick.
  // Alternatively, the original HTML used a hardcoded path for the partial arc, but we can compute it using strokeDasharray!
  
  // Total arc length is approximately 255.
  const arcLength = 255;
  const strokeDashoffset = arcLength - (arcLength * progress);

  const sunPos = getBezierPoint(progress);

  return (
    <View className="mt-4 pt-3 border-t border-[#cbd5e1]/30 dark:border-[#3e484f]/30 flex-col">
      <Pressable 
        onPress={() => setExpanded(!expanded)} 
        className="flex-row items-center justify-between py-1"
      >
        <View className="flex-row items-center gap-2 opacity-90">
          <Sun size={15} color="#FBBF24" />
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            Solar Trajectory
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {timeLeft ? (
            <View className="flex-row items-center gap-1 bg-[#FBBF24]/10 px-2 py-0.5 rounded-full border border-[#FBBF24]/20">
              <Clock size={11} color="#FBBF24" />
              <Text className="text-[#FBBF24] text-[10px]" style={{ fontFamily: 'Inter_500Medium' }}>
                {timeLeft}
              </Text>
            </View>
          ) : null}
          <Animated.View style={animatedChevStyle}>
            <ChevronDown size={16} color={isDark ? '#87929a' : '#64748b'} />
          </Animated.View>
        </View>
      </Pressable>

      <Animated.View style={animatedBodyStyle}>
        <View className="flex-col gap-2 pt-2">
          
          <View className="w-full h-14 flex items-center justify-end px-2">
            <Svg width="100%" height={56} viewBox="0 0 280 56">
              <Defs>
                <LinearGradient id="solarArcGradSubtle" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
                  <Stop offset="65%" stopColor="#FBBF24" stopOpacity="0.75" />
                  <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                </LinearGradient>
                <RadialGradient id="sunAuraSubtle" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                  <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Horizon Line */}
              <Line x1="20" y1="48" x2="260" y2="48" stroke={isDark ? '#3e484f' : '#cbd5e1'} strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
              
              {/* Full Background Arc */}
              <Path d="M 20 48 C 60 12, 220 12, 260 48" fill="none" stroke={isDark ? '#313540' : '#e2e8f0'} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55" />
              
              {/* Active Elapsed Arc */}
              <Path 
                d="M 20 48 C 60 12, 220 12, 260 48" 
                fill="none" 
                stroke="url(#solarArcGradSubtle)" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
              />

              {/* Dynamic Sun Position */}
              {isDayTime && (
                <>
                  <Circle cx={sunPos.x} cy={sunPos.y} r="9" fill="url(#sunAuraSubtle)" opacity="0.6" />
                  <Circle cx={sunPos.x} cy={sunPos.y} r="4" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1" />
                  <Circle cx={sunPos.x} cy={sunPos.y} r="1.5" fill="#FFF" />
                </>
              )}

              {/* Text Labels */}
              <SvgText x="20" y="44" fill={isDark ? '#87929a' : '#64748b'} fontSize="8.5" fontFamily="Space Grotesk" opacity="0.75" fontWeight="500">
                {sunriseStr}
              </SvgText>
              <SvgText x="242" y="44" fill={isDark ? '#87929a' : '#64748b'} fontSize="8.5" fontFamily="Space Grotesk" opacity="0.75" fontWeight="500">
                {sunsetStr}
              </SvgText>
            </Svg>
          </View>

          {/* Sunrise / Sunset blocks */}
          <View className="flex-row justify-between gap-3 mt-1">
            <View className="flex-1 flex-row items-center gap-2 p-2 rounded-lg bg-[#e2e8f0]/40 dark:bg-[#262a35]/40 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30">
              <View className="w-6 h-6 rounded-full bg-amber-400/10 items-center justify-center">
                <Sunrise size={14} color="#fbbf24" />
              </View>
              <View className="flex-col">
                <Text className="text-[#475569]/80 dark:text-[#bdc8d1]/80 text-[9px] uppercase tracking-wider" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Sunrise</Text>
                <Text className="text-[#0f172a]/90 dark:text-[#dfe2f1]/90 text-[12px] font-medium" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                  {formatTimeAMPM(sunriseStr)}
                </Text>
              </View>
            </View>
            
            <View className="flex-1 flex-row items-center gap-2 p-2 rounded-lg bg-[#e2e8f0]/40 dark:bg-[#262a35]/40 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30">
              <View className="w-6 h-6 rounded-full bg-[#0284c7]/10 dark:bg-[#38bdf8]/10 items-center justify-center">
                <Sunset size={14} color={isDark ? '#38bdf8' : '#0284c7'} />
              </View>
              <View className="flex-col">
                <Text className="text-[#475569]/80 dark:text-[#bdc8d1]/80 text-[9px] uppercase tracking-wider" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Sunset</Text>
                <Text className="text-[#0f172a]/90 dark:text-[#dfe2f1]/90 text-[12px] font-medium" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
                  {formatTimeAMPM(sunsetStr)}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </Animated.View>
    </View>
  );
};
