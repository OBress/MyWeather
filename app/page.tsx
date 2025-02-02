"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WeatherDisplay from "@/components/weather/WeatherDisplay";
import ChatInput from "@/components/weather/ChatInput";
import WeatherBackground from "@/components/weather/WeatherBackground";
import ForecastCards from "@/components/weather/ForecastCards";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [location, setLocation] = useState<string>("");
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const loadDefaultLocation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settings?.default_location && settings?.locations) {
        const defaultLocation = settings.locations.find(
          (loc: any) => loc.id === settings.default_location
        );
        if (defaultLocation) {
          setLocation(defaultLocation.address);
        }
      }
    };

    const queryLocation = searchParams.get("location");
    if (queryLocation) {
      setLocation(decodeURIComponent(queryLocation));
    } else {
      loadDefaultLocation();
    }
  }, [searchParams]);

  const handleLocationSubmit = (input: string) => {
    setLocation(input);
  };

  return (
    <>
      <WeatherBackground />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] gap-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl px-4 mt-10"
        >
          <WeatherDisplay location={location} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl px-4 mx-auto flex justify-center"
        >
          <ChatInput onSubmit={handleLocationSubmit} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-4xl px-4"
        >
          <ForecastCards location={location} />
        </motion.div>
      </div>
    </>
  );
}
