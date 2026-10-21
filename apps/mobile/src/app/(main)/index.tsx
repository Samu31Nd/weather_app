import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { HeroWidget } from "../../presentation/components/HeroWidget";
import { HeaderControls } from "../../presentation/components/HeaderControls";
import { TelemetryStrip } from "../../presentation/components/TelemetryStrip";
import { TelemetryGrid } from "../../presentation/components/TelemetryGrid";
import { WindWidget } from "../../presentation/components/WindWidget";
import { ForecastWidget } from "../../presentation/components/ForecastWidget";
import { WeatherEntity } from "../../core/domain/models/WeatherEntity";
import { useDependencies } from "../../infrastructure/di/DependencyProvider";

export default function HomeRoute() {
  const { getLiveWeatherUseCase } = useDependencies();
  const [weatherData, setWeatherData] = useState<WeatherEntity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await getLiveWeatherUseCase.execute();
        setWeatherData(data);
        setLastFetched(new Date());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error fetching data",
        );
      }
    };

    loadWeather();
    // Refresh every 10 seconds
    const interval = setInterval(loadWeather, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-error mb-2 text-center">
          Failed to load telemetry
        </Text>
        <Text className="text-on-surface-variant text-center">{error}</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-12"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderControls lastFetched={lastFetched} />
      <HeroWidget data={weatherData} />
      <ForecastWidget data={weatherData} />
      <TelemetryStrip />
      <TelemetryGrid data={weatherData} />
      <WindWidget data={weatherData} />
    </ScrollView>
  );
}
