import { View, Text, useColorScheme } from "react-native";
import {
  Sun,
  Cloud,
  ArrowUp,
  ArrowDown,
  CloudRain,
  Snowflake,
  CloudLightning,
} from "lucide-react-native";
import { WeatherEntity } from "../../core/domain/models/WeatherEntity";
import { useUnit, convertTemp } from "../contexts/UnitContext";
import { SolarTrajectory } from "./SolarTrajectory";

interface HeroWidgetProps {
  data: WeatherEntity;
}

export const HeroWidget = ({ data }: HeroWidgetProps) => {
  const { unitSystem } = useUnit();
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const iconSize = 140;
  let icon = <Sun size={iconSize} color="#F59E0B" fill="#FDE047" />;
  let conditionText = "Clear & Sunny";
  let desc = "· High Visibility";

  if (data.rain.rate && data.rain.rate > 0) {
    icon = (
      <CloudRain
        size={iconSize}
        color={isDark ? "#818cf8" : "#0ea5e9"}
        fill="#a5b4fc"
      />
    );
    conditionText = "Rainy";
    desc = "· Precipitation";
  } else if (data.forecast.rule > 100) {
    icon = (
      <Cloud
        size={iconSize}
        color={isDark ? "#38bdf8" : "#0284c7"}
        fill="#BAE6FD"
      />
    );
    conditionText = "Partly Cloudy";
    desc = "· Fair Sky";
  }

  const temp = convertTemp(data.outdoor.temperature, unitSystem);
  const highTemp = convertTemp(data.historical.outdoorTemp.dayHigh, unitSystem);
  const lowTemp = convertTemp(data.historical.outdoorTemp.dayLow, unitSystem);

  return (
    <View className="relative w-full rounded-2xl overflow-hidden mt-4">
      {/* Background layer for the card (surface-container/70) */}
      <View className="absolute inset-0 bg-[#f1f5f9]/70 dark:bg-[#1c1f2a]/70" />

      {/* Ambient glow effect inside the card */}
      <View className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-[#0284c7]/20 dark:bg-[#38bdf8]/20 blur-[50px] opacity-70" />

      {/* Card Content */}
      <View className="p-6 relative z-10">
        {/* Top Bar: Condition Header */}
        <View className="flex-row items-start justify-between relative z-10">
          <View className="flex-col gap-1 w-3/4">
            <View className="flex-row items-center gap-2">
              <Text
                className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] tracking-wider uppercase"
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                {data.station.name} Station
              </Text>
              <View className="px-2 py-0.5 rounded-full bg-[#0284c7]/15 dark:bg-[#38bdf8]/15 border border-[#0284c7]/20 dark:border-[#38bdf8]/20">
                <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[10px] font-bold tracking-wide uppercase">
                  Normal
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Text
                className="text-[#0f172a] dark:text-[#dfe2f1] text-[18px] font-light"
                style={{ fontFamily: "Inter_300Light" }}
              >
                {conditionText}
              </Text>
              <Text
                className="text-[#475569] dark:text-[#bdc8d1] text-[12px]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                {desc}
              </Text>
            </View>
          </View>
        </View>

        {/* Huge Expressive Weather Art - Pinned to Top Right Corner */}
        <View
          className="absolute top-2 -right-4 z-0 opacity-80"
          style={{ transform: [{ rotate: "15deg" }] }}
        >
          {/* We add a subtle glowing aura behind the big icon */}
          <View className="absolute inset-0 bg-amber-400/20 rounded-full blur-[40px] scale-150" />
          {icon}
        </View>

        {/* Big Display Temperature */}
        <View className="flex-row items-baseline mt-4 mb-4 relative z-10">
          <Text
            className="text-[#0f172a] dark:text-[#dfe2f1] tracking-tighter"
            style={{
              fontFamily: "Inter_200ExtraLight",
              fontSize: 64,
              lineHeight: 72,
            }}
          >
            {temp?.toFixed(1) || "--"}
          </Text>
          <Text
            className="text-[#0284c7] dark:text-[#38bdf8] font-light ml-1"
            style={{ fontFamily: "Inter_300Light", fontSize: 28 }}
          >
            °{unitSystem === "metric" ? "C" : "F"}
          </Text>
        </View>

        {/* High / Low Diurnal Spread */}
        <View className="flex-row justify-between mt-2 space-x-3 gap-3 relative z-10">
          {/* Day High */}
          <View className="flex-1 flex-row items-center p-3 rounded-lg bg-[#e2e8f0]/40 dark:bg-[#262a35]/40 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 gap-3">
            <View className="w-7 h-7 rounded-full bg-[#ef4444]/15 dark:bg-[#ffb4ab]/15 items-center justify-center shrink-0">
              <ArrowUp size={16} color={isDark ? "#ffb4ab" : "#ef4444"} />
            </View>
            <View className="flex-col">
              <Text
                className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest"
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                Day High
              </Text>
              <Text
                className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px] mt-0.5"
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                {highTemp?.toFixed(1) || "--"}°
              </Text>
            </View>
          </View>

          {/* Night Low */}
          <View className="flex-1 flex-row items-center p-3 rounded-lg bg-[#e2e8f0]/40 dark:bg-[#262a35]/40 border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 gap-3">
            <View className="w-7 h-7 rounded-full bg-[#0284c7]/15 dark:bg-[#38bdf8]/15 items-center justify-center shrink-0">
              <ArrowDown size={16} color={isDark ? "#38bdf8" : "#0284c7"} />
            </View>
            <View className="flex-col">
              <Text
                className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest"
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                Night Low
              </Text>
              <Text
                className="text-[#0f172a] dark:text-[#dfe2f1] text-[22px] mt-0.5"
                style={{ fontFamily: "SpaceGrotesk_600SemiBold" }}
              >
                {lowTemp?.toFixed(1) || "--"}°
              </Text>
            </View>
          </View>
        </View>

        <SolarTrajectory data={data} />
      </View>
    </View>
  );
};
