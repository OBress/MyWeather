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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

        {/* Center content */}
        <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
          <span className="font-semibold">Owen B.</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-14">
                  <div>PM Info</div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  The Product Manager Accelerator Program is designed to support
                  PM professionals through every stage of their careers. From
                  students looking for entry-level jobs to Directors looking to
                  take on a leadership role, our program has helped over
                  hundreds of students fulfill their career aspirations. Our
                  Product Manager Accelerator community are ambitious and
                  committed. Through our program they have learnt, honed and
                  developed new PM and leadership skills, giving them a strong
                  foundation for their future endeavors. Visit our LinkedIn:
                  https://www.linkedin.com/school/pmaccelerator/
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

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
