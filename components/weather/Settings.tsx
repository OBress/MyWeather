"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Power, Save, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useLoadScript } from "@react-google-maps/api";
import { createClient } from "@/utils/supabase/client";

const libraries: "places"[] = ["places"];

interface Location {
  id: string;
  nickname: string;
  address: string;
}

interface UserSettings {
  locations: Location[];
  defaultLocationId: string | null;
  openaiApiKey: string;
}

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newNickname, setNewNickname] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [defaultLocation, setDefaultLocation] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (isLoaded && !autocompleteService) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
    }
  }, [isLoaded, autocompleteService]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError);
          return;
        }

        if (!user) {
          console.error("No user found");
          return;
        }

        // Get the most recent settings record for this user
        const { data: settings, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (settingsError) {
          console.error(
            "Error loading settings:",
            settingsError.message,
            settingsError.details,
            settingsError.hint
          );
          return;
        }

        // If settings exist, use the first record (most recent)
        if (settings && settings.length > 0) {
          setLocations(settings[0].locations || []);
          setDefaultLocation(settings[0].default_location || "");
          setApiKey(settings[0].openai_api_key || "");
        }
      } catch (error) {
        console.error("Error in loadSettings:", error);
      }
    };

    loadSettings();
  }, [supabase]);

  const saveSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // First check if a record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const settings = {
        user_id: user.id,
        default_location: defaultLocation || "", // Use empty string instead of null
        locations: locations || [],
        openai_api_key: apiKey || "",
        updated_at: new Date().toISOString(),
      };

      let error;
      if (!existingSettings) {
        // If no record exists, do an insert
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert(settings);
        error = insertError;
      } else {
        // If record exists, do an update
        const { error: updateError } = await supabase
          .from("user_settings")
          .update(settings)
          .eq("user_id", user.id);
        error = updateError;
      }

      if (error) {
        console.error("Error saving settings:", error);
        return;
      }

      setIsSaved(true);
      router.refresh();
    } catch (error) {
      console.error("Error in saveSettings:", error);
    }
  };

  useEffect(() => {
    if (!newAddress || !autocompleteService || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const results = await autocompleteService.getPlacePredictions({
          input: newAddress,
          types: [], // Allow all types of locations
        });
        setSuggestions(results?.predictions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [newAddress, autocompleteService, showSuggestions]);

  const handleSuggestionSelect = (
    suggestion: google.maps.places.AutocompletePrediction,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const address = `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}`;
    setNewAddress(address);
    setShowSuggestions(false);
    // Blur the input element to remove focus
    (document.activeElement as HTMLElement)?.blur();
  };

  const addLocation = async () => {
    if (newNickname && newAddress) {
      const newLocation: Location = {
        id: Date.now().toString(),
        nickname: newNickname,
        address: newAddress,
      };
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      setNewNickname("");
      setNewAddress("");
      setShowSuggestions(false);
      await saveSettings();
    }
  };

  const removeLocation = async (id: string) => {
    const updatedLocations = locations.filter((loc) => loc.id !== id);
    setLocations(updatedLocations);
    if (defaultLocation === id) setDefaultLocation(null);
    await saveSettings();
  };

  const handleDefaultLocationChange = async (id: string) => {
    const newDefaultLocation = defaultLocation === id ? "" : id; // Use empty string instead of null
    setDefaultLocation(newDefaultLocation);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // First check if a record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const settings = {
        user_id: user.id,
        default_location: newDefaultLocation,
        locations: locations || [],
        openai_api_key: apiKey || "",
        updated_at: new Date().toISOString(),
      };

      let error;
      if (!existingSettings) {
        // If no record exists, do an insert
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert(settings);
        error = insertError;
      } else {
        // If record exists, do an update
        const { error: updateError } = await supabase
          .from("user_settings")
          .update(settings)
          .eq("user_id", user.id);
        error = updateError;
      }

      if (error) {
        console.error("Error saving default location:", error);
        // Revert the state if save failed
        setDefaultLocation(defaultLocation);
        return;
      }

      // Refresh the page to update the weather display
      router.refresh();
    } catch (error) {
      console.error("Error in handleDefaultLocationChange:", error);
      // Revert the state if save failed
      setDefaultLocation(defaultLocation);
    }
  };

  const handleLocationClick = (location: Location) => {
    setIsOpen(false);
    router.push(`/?location=${encodeURIComponent(location.address)}`);
  };

  const saveApiKey = async () => {
    await saveSettings();
    setIsSaved(true);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setIsSaved(false);
  };

  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </motion.div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Badge variant={isSaved ? "default" : "secondary"}>
                {isSaved ? "Saved" : "Unsaved"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your OpenAI API key"
              />
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                size="icon"
                variant="outline"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={saveApiKey} size="icon" variant="outline">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Saved Locations</Label>
            <AnimatePresence>
              {locations.map((location) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center justify-between p-2 bg-secondary/90 dark:bg-secondary/40 rounded-md hover:bg-gray-200 dark:hover:bg-secondary/60 cursor-pointer transition-colors"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        defaultLocation === location.id
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDefaultLocationChange(location.id);
                      }}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <div>
                      <p className="font-medium">{location.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocation(location.id);
                    }}
                    className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="grid gap-2">
            <Label>Add New Location</Label>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <div className="relative">
                <Input
                  placeholder="Address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 4 }}
                    exit={{ opacity: 0, y: 0 }}
                    className="absolute left-0 right-0 top-full z-50 mt-1 bg-background/95 backdrop-blur-md border border-border rounded-md shadow-lg overflow-hidden"
                  >
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                      {suggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion.place_id}
                          onClick={(e) => handleSuggestionSelect(suggestion, e)}
                          className="w-full px-3 py-2 text-left hover:bg-accent/50 transition-colors flex items-center gap-2 group"
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                              {suggestion.structured_formatting.main_text}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              <Button onClick={addLocation} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
