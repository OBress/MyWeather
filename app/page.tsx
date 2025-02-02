"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import WeatherDisplay from "@/components/weather/WeatherDisplay";
import ChatInput from "@/components/weather/ChatInput";
import WeatherBackground from "@/components/weather/WeatherBackground";
import ForecastCards from "@/components/weather/ForecastCards";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const [location, setLocation] = useState<string>("");
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: settings, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error loading settings:", error);
          return;
        }

        if (
          settings &&
          settings.length > 0 &&
          settings[0].default_location &&
          settings[0].locations
        ) {
          const defaultLocation = settings[0].locations.find(
            (loc: { id: string; address: string }) =>
              loc.id === settings[0].default_location
          );
          if (defaultLocation) {
            setLocation(defaultLocation.address);
          }
        }
      } catch (error) {
        console.error("Error in loadDefaultLocation:", error);
      }
    };

    const queryLocation = searchParams.get("location");
    if (queryLocation) {
      setLocation(decodeURIComponent(queryLocation));
    } else {
      loadDefaultLocation();
    }
  }, [searchParams, supabase]);

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
          <ChatInput
            onSubmit={handleLocationSubmit}
            currentLocation={location}
          />
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
