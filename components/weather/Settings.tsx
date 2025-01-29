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

interface Location {
  id: string;
  nickname: string;
  address: string;
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
  const router = useRouter();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedLocations = localStorage.getItem("weatherLocations");
    const savedDefaultLocation = localStorage.getItem("defaultLocation");
    const savedApiKey = localStorage.getItem("openaiApiKey");

    if (savedLocations) setLocations(JSON.parse(savedLocations));
    if (savedDefaultLocation) setDefaultLocation(savedDefaultLocation);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem("weatherLocations", JSON.stringify(locations));
    if (defaultLocation)
      localStorage.setItem("defaultLocation", defaultLocation);
  }, [locations, defaultLocation]);

  const saveApiKey = () => {
    localStorage.setItem("openaiApiKey", apiKey);
    setIsSaved(true);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setIsSaved(false);
  };

  const addLocation = () => {
    if (newNickname && newAddress) {
      const newLocation: Location = {
        id: Date.now().toString(),
        nickname: newNickname,
        address: newAddress,
      };
      setLocations([...locations, newLocation]);
      setNewNickname("");
      setNewAddress("");
    }
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    if (defaultLocation === id) setDefaultLocation(null);
  };

  const handleDefaultLocationChange = (id: string) => {
    setDefaultLocation(defaultLocation === id ? null : id);
  };

  const handleLocationClick = (location: Location) => {
    setIsOpen(false);
    router.push(`/?location=${encodeURIComponent(location.address)}`);
  };

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
            <div className="flex space-x-2">
              <Input
                placeholder="Nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <Input
                placeholder="Address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <Button onClick={addLocation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
