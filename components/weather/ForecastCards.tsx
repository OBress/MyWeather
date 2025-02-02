"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Droplets, LucideIcon } from "lucide-react";
import { createElement } from "react";
import { WeatherResponse } from "@/types/weather";
import { getCurrentWeather, formatTemperature } from "@/utils/weather";

interface ForecastCardsProps {
  location?: string;
}

const IconMap: Record<number, LucideIcon> = {
  1000: Sun, // Sunny/Clear
  1003: Cloud, // Partly cloudy
  1006: Cloud, // Cloudy
  1009: Cloud, // Overcast
  1030: Cloud, // Mist
  1063: CloudRain, // Patchy rain
  1066: CloudRain, // Patchy snow
  1069: CloudRain, // Patchy sleet
  1072: CloudRain, // Patchy freezing drizzle
  1087: CloudRain, // Thundery outbreaks
  1114: CloudRain, // Blowing snow
  1117: CloudRain, // Blizzard
  1135: Cloud, // Fog
  1147: Cloud, // Freezing fog
  1150: CloudRain, // Patchy light drizzle
  1153: CloudRain, // Light drizzle
  1168: CloudRain, // Freezing drizzle
  1171: CloudRain, // Heavy freezing drizzle
  1180: CloudRain, // Patchy light rain
  1183: CloudRain, // Light rain
  1186: CloudRain, // Moderate rain at times
  1189: CloudRain, // Moderate rain
  1192: CloudRain, // Heavy rain at times
  1195: CloudRain, // Heavy rain
  1198: CloudRain, // Light freezing rain
  1201: CloudRain, // Moderate or heavy freezing rain
  1204: CloudRain, // Light sleet
  1207: CloudRain, // Moderate or heavy sleet
  1210: CloudRain, // Patchy light snow
  1213: CloudRain, // Light snow
  1216: CloudRain, // Patchy moderate snow
  1219: CloudRain, // Moderate snow
  1222: CloudRain, // Patchy heavy snow
  1225: CloudRain, // Heavy snow
  1237: CloudRain, // Ice pellets
  1240: CloudRain, // Light rain shower
  1243: CloudRain, // Moderate or heavy rain shower
  1246: CloudRain, // Torrential rain shower
  1249: CloudRain, // Light sleet showers
  1252: CloudRain, // Moderate or heavy sleet showers
  1255: CloudRain, // Light snow showers
  1258: CloudRain, // Moderate or heavy snow showers
  1261: CloudRain, // Light showers of ice pellets
  1264: CloudRain, // Moderate or heavy showers of ice pellets
  1273: CloudRain, // Patchy light rain with thunder
  1276: CloudRain, // Moderate or heavy rain with thunder
  1279: CloudRain, // Patchy light snow with thunder
  1282: CloudRain, // Moderate or heavy snow with thunder
};

export default function ForecastCards({ location }: ForecastCardsProps) {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) {
        const defaultLocations = [
          "London, England, United Kingdom",
          "New York, NY, United States",
          "Tokyo, Japan",
          "Paris, France",
          "Sydney, NSW, Australia",
        ];
        const randomLocation =
          defaultLocations[Math.floor(Math.random() * defaultLocations.length)];
        try {
          const data = await getCurrentWeather(randomLocation);
          setWeatherData(data);
          setError(null);
        } catch (error) {
          const err = error as Error;
          setError(err.message || "Failed to fetch weather data");
          console.error("Forecast error:", err);
        }
        return;
      }

      try {
        // Use the full location string from Google Places
        console.log("Forecast - Using full location:", location);
        const data = await getCurrentWeather(location);
        setWeatherData(data);
        setError(null);
      } catch (error) {
        const err = error as Error;
        setError(err.message || "Failed to fetch weather data");
        console.error("Forecast error:", err);
      }
    }

    fetchWeather();
  }, [location]);

  if (error) {
    return (
      <div className="mt-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!weatherData?.forecast?.forecastday) {
    return (
      <div className="mt-8">
        <p className="text-center">Loading forecast data...</p>
      </div>
    );
  }

  // Get 6 days of forecast (skip today since it's shown in the main card)
  const futureForecast = weatherData.forecast.forecastday.slice(1, 7);

  console.log(
    "Forecast dates:",
    futureForecast.map((f) => f.date)
  ); // Debug log
  console.log(weatherData.location.tz_id);
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {futureForecast.map((forecast, index) => (
        <motion.div
          key={forecast.date}
          className="bg-card text-card-foreground rounded-lg shadow-md p-4 text-center backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2">
            {new Date(forecast.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: weatherData.location.tz_id,
            })}
          </h3>
          <div className="w-12 h-12 mx-auto mb-2">
            {createElement(IconMap[forecast.day.condition.code] || Cloud, {
              className: "w-full h-full",
            })}
          </div>
          <div className="text-xl font-bold mb-2">
            <span className="text-primary">
              {formatTemperature(forecast.day.maxtemp_f, "F")}
            </span>
            <span className="text-sm text-muted-foreground mx-1">/</span>
            <span className="text-lg text-muted-foreground">
              {formatTemperature(forecast.day.mintemp_f, "F")}
            </span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Cloud className="h-4 w-4" />
              <span>{forecast.day.condition.text}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Droplets className="h-4 w-4" />
              <span>{forecast.day.daily_chance_of_rain}% rain</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
