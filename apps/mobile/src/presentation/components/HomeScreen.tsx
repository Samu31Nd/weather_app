import { useState } from "react";
import { Text, View, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const HomeScreen = () => {
  const [text, onChangeText] = useState("useless text");

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-black font-bold mb-4" style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>Home Screen</Text>
      <SafeAreaProvider>
        <SafeAreaView>
          <TextInput
            className="text-black h-12 w-48 m-3 border border-gray-300 p-3 rounded"
            onChangeText={onChangeText}
            value={text}
            style={{ fontFamily: 'SpaceGrotesk_400Regular' }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
};
