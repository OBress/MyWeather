"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LocationSuggestionsProps {
  suggestions: google.maps.places.AutocompletePrediction[];
  onSelect: (place: google.maps.places.AutocompletePrediction) => void;
  visible: boolean;
}

export default function LocationSuggestions({
  suggestions,
  onSelect,
  visible,
}: LocationSuggestionsProps) {
  return (
    <AnimatePresence>
      {visible && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 8 }}
          exit={{ opacity: 0, y: 0 }}
          className="suggestions-container absolute left-0 right-0 top-full z-50 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
            {suggestions.slice(0, 5).map((suggestion) => (
              <motion.button
                key={suggestion.place_id}
                onClick={() => onSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors flex items-center gap-2 group"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base group-hover:text-primary transition-colors truncate">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
