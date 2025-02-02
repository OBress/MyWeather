"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Deterministic but random-looking position generator
const generateStarPosition = (index: number) => {
  // Use golden ratio for natural distribution
  const goldenRatio = 1.618033988749895;
  const angleStep = goldenRatio * Math.PI * 2;

  // Generate radius using a fibonacci-like sequence
  const radius = 50 + 40 * Math.sin(index * goldenRatio);

  // Calculate position using polar coordinates
  const angle = index * angleStep;
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  // Round values to 4 decimal places for consistent rendering
  return {
    top: `${Math.abs(y % 100).toFixed(4)}%`,
    left: `${Math.abs(x % 100).toFixed(4)}%`,
    duration: 2 + Math.abs(Math.sin(index) * 3),
    delay: Math.abs(Math.cos(index) * 2),
    scale: Number(
      (0.5 + Math.abs(Math.sin(index * goldenRatio) * 0.5)).toFixed(4)
    ),
  };
};

export default function WeatherBackground() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  // Pre-generate star positions using our deterministic pattern
  const starPositions = Array.from({ length: 100 }, (_, i) =>
    generateStarPosition(i)
  );

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
          {starPositions.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                transform: `scale(${star.scale})`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [star.scale * 0.8, star.scale * 1.2, star.scale * 0.8],
              }}
              transition={{
                duration: star.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: star.delay,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
