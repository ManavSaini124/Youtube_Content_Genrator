"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  const calculateTimeLeft = () => {
    const difference = +new Date("2025-12-31") - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // only render countdown after client mount

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-center px-4">
      <motion.h1
        className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Coming Soon
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-600 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        We’re working hard to launch something amazing. Stay tuned!
      </motion.p>

      {/* Render countdown only after hydration */}
      {mounted && (
        <motion.div
          className="flex gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          {["days", "hours", "minutes", "seconds"].map((interval, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900">
                {timeLeft[interval] ?? "0"}
              </span>
              <span className="text-gray-500 capitalize">{interval}</span>
            </div>
          ))}
        </motion.div>
      )}

      <motion.button
        className="px-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => alert("You will be notified when we launch!")}
      >
        Notify Me
      </motion.button>
    </div>
  );
}
