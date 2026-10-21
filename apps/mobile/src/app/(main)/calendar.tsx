import { View, Text } from "react-native";

export default function CalendarRoute() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text
        className="text-[#0f172a] dark:text-[#dfe2f1] text-3xl font-bold"
        style={{ fontFamily: "SpaceGrotesk_700Bold" }}
      >
        Historical & Forecast (Mock)
      </Text>
    </View>
  );
}
