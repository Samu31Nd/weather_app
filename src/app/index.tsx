import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { LoadingScreen } from "../presentation/components/LoadingScreen";
import { HomeScreen } from "../presentation/components/HomeScreen";
import { useStationInitialization } from "../presentation/hooks/useStationInitialization";

export default function Index() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });

  // Use the hook to trigger our Domain Use Case instead of a simple timeout
  const { isLoading, station } = useStationInitialization('station-01');

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen fontsLoaded={fontsLoaded} />;
  }

  return <HomeScreen />;
}
