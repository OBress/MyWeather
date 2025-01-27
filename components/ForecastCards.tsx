"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Sun,
  CloudRain,
  ChevronDown,
  Droplets,
  Wind,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createElement } from "react";

interface ForecastItem {
  day: string;
  icon: keyof typeof IconMap;
  temp: string;
  precipitation: string;
  humidity: string;
  wind: string;
}

const IconMap = {
  Sun,
  Cloud,
  CloudRain,
} as const;

const forecastData: ForecastItem[] = [
  {
    day: "Mon",
    icon: "Sun",
    temp: "75°F",
    precipitation: "0%",
    humidity: "45%",
    wind: "5 mph",
  },
  {
    day: "Tue",
    icon: "Cloud",
    temp: "72°F",
    precipitation: "20%",
    humidity: "55%",
    wind: "8 mph",
  },
  {
    day: "Wed",
    icon: "CloudRain",
    temp: "68°F",
    precipitation: "70%",
    humidity: "80%",
    wind: "12 mph",
  },
  {
    day: "Thu",
    icon: "Sun",
    temp: "78°F",
    precipitation: "10%",
    humidity: "40%",
    wind: "6 mph",
  },
  {
    day: "Fri",
    icon: "Cloud",
    temp: "71°F",
    precipitation: "30%",
    humidity: "60%",
    wind: "9 mph",
  },
];

export default function ForecastCards() {
  const [selectedStat, setSelectedStat] = useState<Record<string, string>>({});

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
      {forecastData.map((forecast, index) => (
        <motion.div
          key={forecast.day}
          className="bg-card text-card-foreground rounded-lg shadow-md p-4 text-center backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2">{forecast.day}</h3>
          <div className="w-12 h-12 mx-auto mb-2">
            {createElement(IconMap[forecast.icon], {
              className: "w-full h-full",
            })}
          </div>
          <p className="text-xl font-bold mb-2">{forecast.temp}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedStat[forecast.day] || "More Info"}{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  setSelectedStat({
                    ...selectedStat,
                    [forecast.day]: "Precipitation",
                  })
                }
              >
                <Droplets className="mr-2 h-4 w-4" />
                <span>Precipitation: {forecast.precipitation}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setSelectedStat({
                    ...selectedStat,
                    [forecast.day]: "Humidity",
                  })
                }
              >
                <Cloud className="mr-2 h-4 w-4" />
                <span>Humidity: {forecast.humidity}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setSelectedStat({ ...selectedStat, [forecast.day]: "Wind" })
                }
              >
                <Wind className="mr-2 h-4 w-4" />
                <span>Wind: {forecast.wind}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedStat[forecast.day] && (
            <p className="mt-2 text-sm">
              {selectedStat[forecast.day]}:{" "}
              {
                forecast[
                  selectedStat[
                    forecast.day
                  ].toLowerCase() as keyof typeof forecast
                ]
              }
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
