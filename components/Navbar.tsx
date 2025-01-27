"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoonIcon, SunIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <motion.nav
        className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            WeatherApp
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <div className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <Button>Sign In</Button>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          WeatherApp
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          <Button onClick={() => setIsSignedIn(!isSignedIn)}>
            {isSignedIn ? "Sign Out" : "Sign In"}
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
