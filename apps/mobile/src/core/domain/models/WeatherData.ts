export interface WeatherData {
  locationName: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow';
  conditionText: string;
  highTemp: number;
  lowTemp: number;
}
