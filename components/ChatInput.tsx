"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (input: string) => void;
}

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
      setIsExpanded(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only collapse if clicking outside the form
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsExpanded(false);
    }
  };

  return (
    <motion.div className="relative">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.form
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            className="flex items-center bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg h-20"
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
              className="flex-1 flex items-center"
            >
              <input
                type="text"
                placeholder="Enter location or ask about weather..."
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
                onClick={() => setIsExpanded(false)}
                className="mr-2"
              >
                <X className="h-20 w-20" />
              </Button>
            </motion.div>
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
