"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, Moon, Wind, Droplets, Thermometer } from "lucide-react";
import { WeatherResponse } from "@/types/weather";
import { getCurrentWeather, formatTemperature } from "@/utils/weather";

interface WeatherDisplayProps {
  location: string;
}

export default function WeatherDisplay({ location }: WeatherDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

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
          console.error("Weather display error:", err);
        }
        return;
      }

      try {
        // Use the full location string from Google Places
        console.log("Using full location:", location);
        const data = await getCurrentWeather(location);
        setWeatherData(data);
        setError(null);
      } catch (error) {
        const err = error as Error;
        setError(err.message || "Failed to fetch weather data");
        console.error("Weather display error:", err);
      }
    }

    fetchWeather();
  }, [location]);

  if (error) {
    return (
      <motion.div
        className="bg-card text-card-foreground rounded-lg shadow-lg p-8 backdrop-blur-md bg-opacity-80"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-center text-red-500">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-card text-card-foreground rounded-lg shadow-lg p-8 backdrop-blur-md bg-opacity-80"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center">
        Weather for {weatherData?.location.name || "Loading..."}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center">
          <div className="flex justify-center items-center space-x-4">
            {isDaytime ? (
              <Sun className="w-20 h-20 text-yellow-400" />
            ) : (
              <Moon className="w-20 h-20 text-gray-300" />
            )}
            <Cloud className="w-24 h-24 text-gray-400" />
          </div>
          <p className="text-6xl font-bold my-4">
            {weatherData
              ? formatTemperature(weatherData.current.temp_f, "F")
              : "Loading..."}
          </p>
          <p className="text-2xl">
            {weatherData?.current.condition.text || "Loading..."}
          </p>
          {weatherData?.forecast?.forecastday[0] && (
            <p className="text-lg text-muted-foreground mt-1">
              H:{" "}
              {formatTemperature(
                weatherData.forecast.forecastday[0].day.maxtemp_f,
                "F"
              )}{" "}
              L:{" "}
              {formatTemperature(
                weatherData.forecast.forecastday[0].day.mintemp_f,
                "F"
              )}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Thermometer className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Feels Like</p>
              <p className="text-lg font-semibold">
                {weatherData
                  ? formatTemperature(weatherData.current.feelslike_f, "F")
                  : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Wind className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Wind</p>
              <p className="text-lg font-semibold">
                {weatherData
                  ? `${Math.round(weatherData.current.wind_kph * 0.621371)} mph`
                  : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Droplets className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Humidity</p>
              <p className="text-lg font-semibold">
                {weatherData
                  ? `${weatherData.current.humidity}%`
                  : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Sun className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">UV Index</p>
              <p className="text-lg font-semibold">
                {weatherData
                  ? `${weatherData.current.uv} (${getUVDescription(
                      weatherData.current.uv
                    )})`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getUVDescription(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}
