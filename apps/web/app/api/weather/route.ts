// API Route - Proxy for weather data to avoid CORS issues
// This acts as the entry point in the hexagonal architecture

import { NextResponse } from 'next/server'
import { weatherApiAdapter } from '@/lib/infrastructure/weather-api.adapter'
import { GetWeatherUseCase } from '@/lib/application/get-weather.usecase'

export async function GET() {
  try {
    // Dependency injection: inject the adapter into the use case
    const getWeatherUseCase = new GetWeatherUseCase(weatherApiAdapter)
    const weatherData = await getWeatherUseCase.execute()

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

// Revalidate every 60 seconds
export const revalidate = 60
