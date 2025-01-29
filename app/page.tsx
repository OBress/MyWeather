"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import WeatherDisplay from "@/components/weather/WeatherDisplay";
import ChatInput from "@/components/weather/ChatInput";
import WeatherBackground from "@/components/weather/WeatherBackground";
import ForecastCards from "@/components/weather/ForecastCards";

export default function Home() {
  const [location, setLocation] = useState("");

  const handleChatSubmit = (input: string) => {
    setLocation(input);
    // In a real app, you would fetch weather data here
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-300 to-blue-100 dark:from-blue-950 dark:to-blue-900" />
      <div className="relative z-10">
        <WeatherBackground />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WeatherDisplay location={location} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex justify-center"
          >
            <ChatInput onSubmit={handleChatSubmit} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ForecastCards />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
