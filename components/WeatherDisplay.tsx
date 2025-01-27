"use client";

import { motion } from "framer-motion";
import { Cloud, Sun, Moon, Wind, Droplets, Thermometer } from "lucide-react";

interface WeatherDisplayProps {
  location: string;
}

export default function WeatherDisplay({ location }: WeatherDisplayProps) {
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

  return (
    <motion.div
      className="bg-card text-card-foreground rounded-lg shadow-lg p-8 backdrop-blur-md bg-opacity-80"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center">
        Weather for {location || "Your Location"}
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
          <p className="text-6xl font-bold my-4">72°F</p>
          <p className="text-2xl">Partly Cloudy</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Thermometer className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Feels Like</p>
              <p className="text-lg font-semibold">75°F</p>
            </div>
          </div>
          <div className="flex items-center">
            <Wind className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Wind</p>
              <p className="text-lg font-semibold">8 mph</p>
            </div>
          </div>
          <div className="flex items-center">
            <Droplets className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">Humidity</p>
              <p className="text-lg font-semibold">65%</p>
            </div>
          </div>
          <div className="flex items-center">
            <Sun className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm">UV Index</p>
              <p className="text-lg font-semibold">5 (Moderate)</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
