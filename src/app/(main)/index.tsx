import { View, ScrollView } from 'react-native';
import { HeroWidget } from '../../presentation/components/HeroWidget';
import { HeaderControls } from '../../presentation/components/HeaderControls';
import { TelemetryStrip } from '../../presentation/components/TelemetryStrip';
import { TelemetryGrid } from '../../presentation/components/TelemetryGrid';
import { WindWidget } from '../../presentation/components/WindWidget';
import { WeatherData } from '../../core/domain/models/WeatherData';

export default function HomeRoute() {
  const mockWeather: WeatherData = {
    locationName: 'Aether Base • Sector 7',
    temperature: 72,
    condition: 'cloudy',
    conditionText: 'Partly Cloudy',
    highTemp: 78,
    lowTemp: 64,
  };

  return (
    <ScrollView 
      className="flex-1 px-4 pt-12"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderControls />
      <HeroWidget data={mockWeather} />
      <TelemetryStrip />
      <TelemetryGrid />
      <WindWidget />
    </ScrollView>
  );
}
