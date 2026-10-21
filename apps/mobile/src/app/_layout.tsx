import { Stack } from "expo-router";
import "../../global.css";
import { DependencyProvider } from "../infrastructure/di/DependencyProvider";
import { UnitProvider } from "../presentation/contexts/UnitContext";
import { ThemeProvider } from "../presentation/contexts/ThemeProvider";

export default function RootLayout() {
  return (
    <DependencyProvider>
      <ThemeProvider>
        <UnitProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </UnitProvider>
      </ThemeProvider>
    </DependencyProvider>
  );
}
