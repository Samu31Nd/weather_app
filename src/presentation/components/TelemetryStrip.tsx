import { View, Text, ScrollView, Pressable } from 'react-native';

export const TelemetryStrip = () => {
  return (
    <View className="flex-col mt-6 mb-2">
      {/* Header Row */}
      <View className="flex-row items-center justify-between px-1 mb-3">
        <Text className="text-on-surface-variant text-[11px] tracking-wider uppercase" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
          Active Telemetry Channels
        </Text>
        <Pressable>
          <Text className="text-primary text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            Sync Ping
          </Text>
        </Pressable>
      </View>

      {/* Scrollable Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
        <Pressable className="flex-row items-center bg-[#262a35]/70 px-4 py-2 rounded-full border border-white/5 mr-2">
          <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            TEMP
          </Text>
          <Text className="text-primary text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            °C
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#262a35]/70 px-4 py-2 rounded-full border border-white/5 mr-2">
          <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            BAR
          </Text>
          <Text className="text-primary text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            hPa
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#262a35]/70 px-4 py-2 rounded-full border border-white/5 mr-2">
          <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            WIND
          </Text>
          <Text className="text-primary text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            km/h
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center bg-[#262a35]/70 px-4 py-2 rounded-full border border-white/5 mr-2">
          <Text className="text-on-surface-variant text-[11px] uppercase tracking-widest" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            RAIN
          </Text>
          <Text className="text-primary text-[11px] uppercase tracking-widest ml-1.5" style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>
            mm
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
