"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LLMResponseProps {
  response: string | null;
  onClose: () => void;
  isVisible: boolean;
}

export default function LLMResponse({
  response,
  onClose,
  isVisible,
}: LLMResponseProps) {
  return (
    <AnimatePresence mode="wait">
      {response && isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 8, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 right-0 top-full z-50 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 relative">
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
            <p className="text-lg pr-8 leading-relaxed">{response}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
