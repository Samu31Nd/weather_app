import { View, Text, ScrollView, Pressable } from 'react-native';

export const TelemetryStrip = () => {
  return (
    <View className="flex-col mt-6 mb-2">
      {/* Header Row */}
      <View className="flex-row items-center justify-between px-1 mb-3">
        <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] tracking-wider uppercase" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
          Active Telemetry Channels
        </Text>
        <Pressable>
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            Sync Ping
          </Text>
        </Pressable>
      </View>

      {/* Scrollable Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
        <Pressable className="flex-row items-center bg-[#e2e8f0]/70 dark:bg-[#262a35]/70 px-4 py-2 rounded-full border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 mr-2">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            TEMP
          </Text>
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            °C
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#e2e8f0]/70 dark:bg-[#262a35]/70 px-4 py-2 rounded-full border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 mr-2">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            BAR
          </Text>
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            hPa
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#e2e8f0]/70 dark:bg-[#262a35]/70 px-4 py-2 rounded-full border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 mr-2">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            WIND
          </Text>
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            km/h
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#e2e8f0]/70 dark:bg-[#262a35]/70 px-4 py-2 rounded-full border border-[#cbd5e1]/30 dark:border-[#3e484f]/30 mr-2">
          <Text className="text-[#475569] dark:text-[#bdc8d1] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            RAIN
          </Text>
          <Text className="text-[#0284c7] dark:text-[#38bdf8] text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            mm
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
