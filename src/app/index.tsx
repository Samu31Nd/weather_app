import { useFonts as useSpaceGrotesk, SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts as useInter, Inter_200ExtraLight, Inter_300Light, Inter_400Regular } from "@expo-google-fonts/inter";
import { LoadingScreen } from "../presentation/components/LoadingScreen";
import { useStationInitialization } from "../presentation/hooks/useStationInitialization";
import { Redirect } from 'expo-router';

export default function Index() {
  const [spaceFontsLoaded] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const [interFontsLoaded] = useInter({
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
  });

  const fontsLoaded = spaceFontsLoaded && interFontsLoaded;

  // Use the hook to trigger our Domain Use Case instead of a simple timeout
  const { isLoading, station } = useStationInitialization('station-01');

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen fontsLoaded={fontsLoaded} />;
  }

  return <Redirect href="/(main)" />;
}
