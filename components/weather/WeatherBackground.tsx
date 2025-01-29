"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function WeatherBackground() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  return (
    <div className="fixed inset-0 z-0">
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isDaytime
            ? "bg-gradient-to-b from-blue-300 to-blue-100"
            : "bg-gradient-to-b from-indigo-900 to-indigo-700"
        }`}
      />
      {isDaytime && (
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}
      {!isDaytime && (
        <>
          <motion.div
            className="absolute top-10 right-10 w-16 h-16 bg-gray-200 rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
