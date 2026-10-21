import { View, Text, useColorScheme } from "react-native";
import { CloudRain, Cloud, Sun, Clock, Waves } from "lucide-react-native";
import { WeatherEntity } from "../../core/domain/models/WeatherEntity";
import { useUnit, convertTemp, convertSpeed } from "../contexts/UnitContext";
import { decodeForecastRule } from "../../core/domain/utils/ForecastDecoder";

interface ForecastWidgetProps {
  data: WeatherEntity;
}

export const ForecastWidget = ({ data }: ForecastWidgetProps) => {
  const { unitSystem } = useUnit();
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  // MOCK DATA for the timeline (user requested mock data for now)
  const currentHour = new Date().getHours();
  
  // Base current temperature to anchor the mock
  const baseTemp = data.outdoor.temperature || (unitSystem === 'metric' ? 22 : 72);
  const tempUnit = unitSystem === 'metric' ? 'C' : 'F';
  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph';
  
  // Decode the live forecast rule from the station!
  const liveForecastText = decodeForecastRule(data.forecast.rule);

  const mockTimeline = [
    {
      hour: (currentHour - 2 + 24) % 24,
      offset: "-2h",
      icon: <Sun size={18} color="#F59E0B" fill="#FDE047" />,
      temp: convertTemp(baseTemp + 1.4, unitSystem),
      rainProb: "0%",
      wind: convertSpeed((data.wind.speed || 10) - 2, unitSystem),
      isNow: false,
    },
    {
      hour: (currentHour - 1 + 24) % 24,
      offset: "-1h",
      icon: <Cloud size={18} color={isDark ? "#38bdf8" : "#0284c7"} fill="#BAE6FD" />,
      temp: convertTemp(baseTemp + 0.7, unitSystem),
      rainProb: "10%",
      wind: convertSpeed((data.wind.speed || 12) - 1, unitSystem),
      isNow: false,
    },
    {
      hour: currentHour,
      offset: "Live",
      icon: <Cloud size={19} color={isDark ? "#38bdf8" : "#0284c7"} fill="#BAE6FD" />,
      temp: convertTemp(baseTemp, unitSystem),
      rainProb: "25%",
      wind: convertSpeed(data.wind.speed || 14.5, unitSystem),
      isNow: true,
    },
    {
      hour: (currentHour + 1) % 24,
      offset: "+1h",
      icon: <Cloud size={18} color={isDark ? "#818cf8" : "#0ea5e9"} />,
      temp: convertTemp(baseTemp - 1.4, unitSystem),
      rainProb: "45%",
      wind: convertSpeed((data.wind.speed || 16) + 3.5, unitSystem),
      isNow: false,
    },
    {
      hour: (currentHour + 2) % 24,
      offset: "+2h",
      icon: <CloudRain size={18} color={isDark ? "#818cf8" : "#0ea5e9"} fill="#a5b4fc" />,
      temp: convertTemp(baseTemp - 2.9, unitSystem),
      rainProb: "65%",
      wind: convertSpeed((data.wind.speed || 18) + 6.5, unitSystem),
      isNow: false,
    },
  ];

  return (
    <View className="flex-col gap-4 mt-4 w-full">
      {/* Short-Term Synoptic Forecast Outlook Briefing Card */}
      <View className="relative rounded-2xl bg-[#f8fafc]/85 dark:bg-[#1e293b]/85 border border-white/90 dark:border-white/10 p-4 overflow-hidden shadow-sm shadow-black/5 dark:shadow-black/20">
        <View className="flex-row items-center justify-between pb-2 border-b border-[#f1f5f9] dark:border-[#334155]">
          <View className="flex-row items-center gap-1.5">
            <Waves size={16} color={isDark ? "#38bdf8" : "#0284c7"} />
            <Text
              className="text-[#64748b] dark:text-[#94a3b8] text-[11px] uppercase tracking-wider"
              style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
            >
              Short-Term Outlook · Synoptic Brief
            </Text>
          </View>
          <View className="px-2 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-[#0284c7]/20 border border-[#e0f2fe] dark:border-[#0284c7]/30">
            <Text
              className="text-[#0284c7] dark:text-[#38bdf8] text-[9px] font-bold uppercase tracking-wider"
              style={{ fontFamily: "SpaceGrotesk_700Bold" }}
            >
              Next 6 Hours
            </Text>
          </View>
        </View>
        <Text
          className="text-[#334155] dark:text-[#cbd5e1] text-[13px] font-medium leading-relaxed pt-2"
          style={{ fontFamily: "Inter_500Medium" }}
        >
          {liveForecastText}
        </Text>
      </View>

      {/* 5-Hour Centered Timeline Forecast Strip */}
      <View className="flex-col gap-1.5">
        <View className="flex-row items-center justify-between px-1">
          <View className="flex-row items-center gap-1.5">
            <Clock size={12} color={isDark ? "#38bdf8" : "#0284c7"} />
            <Text
              className="text-[#64748b] dark:text-[#94a3b8] text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
            >
              5-Hour Timeline Forecast
            </Text>
          </View>
          <Text
            className="text-[#94a3b8] dark:text-[#64748b] text-[9px] uppercase tracking-wide"
            style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
          >
            Centered on Live
          </Text>
        </View>

        <View className="flex-row justify-between gap-1.5">
          {mockTimeline.map((item, index) => (
            <View
              key={index}
              className={`flex-1 flex-col items-center justify-between p-2 rounded-xl text-center shadow-sm shadow-black/5 dark:shadow-black/20 ${
                item.isNow
                  ? "bg-white/95 dark:bg-[#1e293b]/95 border border-[#0284c7]/50 dark:border-[#38bdf8]/50"
                  : "bg-white/80 dark:bg-[#1e293b]/80 border border-[#e2e8f0]/70 dark:border-white/5 opacity-80"
              }`}
            >
              {item.isNow && (
                <View className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-[#0284c7] dark:bg-[#38bdf8] shadow-sm">
                  <Text
                    className="text-white dark:text-[#0f172a] text-[7px] font-bold tracking-wider uppercase"
                    style={{ fontFamily: "SpaceGrotesk_700Bold" }}
                  >
                    NOW
                  </Text>
                </View>
              )}
              
              <Text
                className={`${
                  item.isNow ? "text-[#0284c7] dark:text-[#38bdf8]" : "text-[#64748b] dark:text-[#94a3b8]"
                } text-[10px] uppercase tracking-tight mt-1`}
                style={{ fontFamily: item.isNow ? "SpaceGrotesk_700Bold" : "SpaceGrotesk_600SemiBold" }}
              >
                {item.hour.toString().padStart(2, "0")}:00
              </Text>
              
              <Text
                className={`${
                  item.isNow ? "text-[#0284c7]/90 dark:text-[#38bdf8]/90" : "text-[#94a3b8] dark:text-[#64748b]"
                } text-[8px] -mt-0.5`}
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                {item.offset}
              </Text>
              
              <View className="my-1.5">
                {item.icon}
              </View>
              
              <Text
                className={`${
                  item.isNow ? "text-[#0284c7] dark:text-[#38bdf8] font-bold" : "text-[#1e293b] dark:text-[#e2e8f0] font-medium"
                } text-[12px]`}
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                {item.temp?.toFixed(1)}°
              </Text>
              
              <View className={`flex-col items-center mt-1 pt-1 border-t w-full ${
                item.isNow ? "border-[#0284c7]/20 dark:border-[#38bdf8]/20" : "border-[#f1f5f9] dark:border-[#334155]"
              }`}>
                <Text
                  className={`text-[8px] font-semibold ${
                    item.isNow ? "text-[#0284c7] dark:text-[#38bdf8]" : "text-[#0284c7] dark:text-[#38bdf8]"
                  }`}
                  style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
                >
                  {item.rainProb}
                </Text>
                <Text
                  className={`text-[7px] tracking-tighter ${
                    item.isNow ? "text-[#0284c7]/90 dark:text-[#38bdf8]/90" : "text-[#94a3b8] dark:text-[#64748b]"
                  }`}
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  {item.wind?.toFixed(0)} {speedUnit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
