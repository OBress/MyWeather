import { WeatherResponse, LocationSuggestion } from "@/types/weather";

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

export async function getCurrentWeather(
  location: string
): Promise<WeatherResponse> {
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
      location
    )}&days=3&aqi=no`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}

export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  if (!query) return [];

  const response = await fetch(
    `${BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location suggestions");
  }

  return response.json();
}

// Helper function to get weather icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https:${iconCode}`;
}

// Helper function to format temperature
export function formatTemperature(temp: number, unit: "C" | "F" = "C"): string {
  return `${Math.round(temp)}°${unit}`;
}

// Helper function to format date
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
} 