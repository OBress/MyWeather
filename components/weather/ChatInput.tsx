"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import LocationSuggestions from "./LocationSuggestions";
import LLMResponse from "./LLMResponse";
import { getCurrentWeather } from "@/utils/weather";
import type { WeatherResponse } from "@/types/weather";
import type { PlaceAutocompleteResult } from "@/types/google-maps";

declare global {
  interface Window {
    google: typeof google;
  }
}

const libraries: Libraries = ["places"];

interface ChatInputProps {
  onSubmit: (input: string) => void;
  currentLocation: string;
}

export default function ChatInput({
  onSubmit,
  currentLocation,
}: ChatInputProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const inputRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [isLLMVisible, setIsLLMVisible] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(
    null
  );

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isLoaded && !autocompleteService) {
      setAutocompleteService(
        new window.google.maps.places.AutocompleteService()
      );
    }
  }, [isLoaded, autocompleteService]);

  useEffect(() => {
    if (!searchInput || !autocompleteService || searchInput.startsWith("@")) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        console.log("Fetching suggestions for:", searchInput);
        const results = await autocompleteService.getPlacePredictions({
          input: searchInput,
          types: [], // Allow all types of locations
        });
        console.log("Suggestions fetched:", results);
        setSuggestions(results?.predictions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 1000); // Reduced debounce time for better responsiveness
    return () => clearTimeout(debounceTimer);
  }, [searchInput, autocompleteService]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!currentLocation) return;
      try {
        const data = await getCurrentWeather(currentLocation);
        setCurrentWeather(data);
      } catch {
        // Error is logged in getCurrentWeather
        setCurrentWeather(null);
      }
    };

    fetchWeather();
  }, [currentLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().startsWith("@")) {
      setIsLLMLoading(true);
      try {
        if (!currentWeather) {
          throw new Error("Weather data not available");
        }
        const response = await handleLLMQuery(
          searchInput.trim().slice(1),
          currentLocation,
          currentWeather
        );
        setLlmResponse(response);
        setIsLLMVisible(true);
      } catch {
        setLlmResponse("Error processing your request. Please try again.");
        setIsLLMVisible(true);
      }
      setIsLLMLoading(false);
      return;
    }

    if (searchInput.trim()) {
      onSubmit(searchInput.trim());
      setSearchInput("");
      setIsExpanded(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: PlaceAutocompleteResult) => {
    const location = `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}`;
    setSearchInput(location);
    onSubmit(location);
    setIsExpanded(false);
    setSuggestions([]);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only collapse if clicking outside the form and suggestions
    const target = e.relatedTarget as Node;
    const form = e.currentTarget;
    if (
      !form.contains(target) &&
      !document.querySelector(".suggestions-container")?.contains(target)
    ) {
      setIsExpanded(false);
      setSuggestions([]);
      setIsLLMVisible(false); // Close LLM response when chat collapses
    }
  };

  const handleCloseLLM = () => {
    setIsLLMVisible(false);
  };

  const handleLLMQuery = async (
    query: string,
    location: string,
    weatherData: WeatherResponse
  ): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, location, weatherData }),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.error || "An error occurred while processing your request";
      }

      return data.content;
    } catch (error) {
      console.error("Error in handleLLMQuery:", error);
      return "An unexpected error occurred. Please try again.";
    }
  };

  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
  }

  return (
    <motion.div className="relative z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.form
            ref={inputRef}
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            className="relative flex items-center bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg h-20"
            initial={{ width: 70, scale: 0.7, opacity: 0 }}
            animate={{
              width: Math.min(screenWidth * 0.8, 800),
              scale: 1,
              opacity: 1,
            }}
            exit={{
              width: 70,
              scale: 0.7,
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            layout
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center h-full"
            >
              <input
                type="text"
                placeholder="Search any location or '@' to ask AI"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent border-none text-2xl px-8 focus:outline-none placeholder:text-muted-foreground/50"
                autoFocus
                style={{ fontSize: "24px" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="mr-2"
              >
                <Search className="h-20 w-20" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setSearchInput("");
                  const inputElement = document.querySelector(
                    'input[type="text"]'
                  ) as HTMLInputElement;
                  inputElement?.focus();
                }}
                className="mr-2"
              >
                <X className="h-20 w-20" />
              </Button>
            </motion.div>
            <LocationSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              visible={isExpanded && suggestions.length > 0}
            />
            <LLMResponse
              response={llmResponse}
              onClose={handleCloseLLM}
              isVisible={isLLMVisible}
            />
            {isLLMLoading && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 8 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-2xl p-6"
              >
                <p className="text-lg text-muted-foreground">
                  Processing query...
                </p>
              </motion.div>
            )}
          </motion.form>
        ) : (
          <motion.button
            onClick={() => setIsExpanded(true)}
            className="bg-primary text-primary-foreground rounded-full w-[70px] h-[70px] flex items-center justify-center shadow-lg"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            layout
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Search className="h-10 w-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
