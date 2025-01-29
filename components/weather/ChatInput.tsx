"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoadScript } from "@react-google-maps/api";
import LocationSuggestions from "./LocationSuggestions";

const libraries: "places"[] = ["places"];

interface ChatInputProps {
  onSubmit: (input: string) => void;
}

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [inputRect, setInputRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

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
      setAutocompleteService(new google.maps.places.AutocompleteService());
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!input || !autocompleteService || input.startsWith("@")) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        console.log("Fetching suggestions for:", input);
        const results = await autocompleteService.getPlacePredictions({
          input,
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
  }, [input, autocompleteService]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      const updateRect = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (rect) {
          setInputRect(rect);
        }
      };

      updateRect();
      // Update rect on animation completion
      setTimeout(updateRect, 300);

      // Also update on window resize
      window.addEventListener("resize", updateRect);
      return () => window.removeEventListener("resize", updateRect);
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
      setIsExpanded(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (
    suggestion: google.maps.places.AutocompletePrediction
  ) => {
    const location = `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}`;
    setInput(location);
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
                  setInput("");
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
