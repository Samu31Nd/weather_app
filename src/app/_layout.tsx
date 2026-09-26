import { Stack } from "expo-router";
import "../../global.css";
import { DependencyProvider } from "../infrastructure/di/DependencyProvider";

export default function RootLayout() {
  return (
    <DependencyProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DependencyProvider>
  );
}
