import { Stack } from "expo-router";
import "../../global.css";
import { DependencyProvider } from "../infrastructure/di/DependencyProvider";
import { UnitProvider } from "../presentation/contexts/UnitContext";

export default function RootLayout() {
  return (
    <DependencyProvider>
      <UnitProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UnitProvider>
    </DependencyProvider>
  );
}
