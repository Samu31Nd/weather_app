import { View, Text } from 'react-native';

export default function HomeRoute() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-white text-3xl font-bold" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>
        Live Weather (Mock)
      </Text>
    </View>
  );
}
