import { WeatherResponse, LocationSuggestion } from "@/types/weather";

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

export async function getCurrentWeather(
  location: string
): Promise<WeatherResponse> {
  try {
    // Use the full location string for more specific search
    console.log("Fetching weather data for:", location);

    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
        location
      )}&days=8&aqi=no`
    );

    console.log("Weather API response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Weather API error response:", errorText);
      throw new Error(`Failed to fetch weather data: ${errorText}`);
    }

    const data = await response.json();
    console.log("Weather API response data:", data);

    // Validate the response data
    if (!data.location || !data.current || !data.forecast) {
      console.error("Invalid weather data format:", data);
      throw new Error("Invalid weather data received from API");
    }

    return data;
  } catch (error) {
    console.error("Error in getCurrentWeather:", error);
    throw error;
  }
}

export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  if (!query) return [];

  try {
    console.log("Searching locations for:", query);
    const response = await fetch(
      `${BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
    );

    console.log("Location search response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Location search error response:", errorText);
      throw new Error(`Failed to fetch location suggestions: ${errorText}`);
    }

    const data = await response.json();
    console.log("Location search results:", data);
    return data;
  } catch (error) {
    console.error("Error in searchLocations:", error);
    throw error;
  }
}

// Helper function to get weather icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https:${iconCode}`;
}

// Helper function to format temperature
export function formatTemperature(temp: number, unit: "C" | "F" = "C"): string {
  return `${Math.round(temp)}°${unit}`;
}

// Helper function to format date with timezone
export function formatDate(dateStr: string, timezone: string): string {
  // Create a date in UTC to avoid timezone conversion issues
  const date = new Date(dateStr + 'T00:00:00Z');
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

// Helper function to check if a date is today
export function isToday(dateStr: string, timezone: string): boolean {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date();
  const dateInTz = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const todayInTz = new Date(today.toLocaleString("en-US", { timeZone: timezone }));
  return (
    dateInTz.getDate() === todayInTz.getDate() &&
    dateInTz.getMonth() === todayInTz.getMonth() &&
    dateInTz.getFullYear() === todayInTz.getFullYear()
  );
} 