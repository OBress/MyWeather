"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { logOut } from "@/app/auth/action";
import Settings from "@/components/weather/Settings";

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<{
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null>(null);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];
        setUserData({
          name,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
      if (session?.user) {
        const user = session.user;
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];
        setUserData({
          name,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
        });
      } else {
        setUserData(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.nav
      className="bg-background/80 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-50 shadow-md"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="MyWeather Logo"
            width={50}
            height={50}
            className="dark:invert mr-3"
          />
          MyWeather
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mounted && (
              <>
                {theme === "light" ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </>
            )}
          </Button>
          <Settings />
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <form action={logOut}>
                <Button>Log Out</Button>
              </form>
            </div>
          ) : (
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
