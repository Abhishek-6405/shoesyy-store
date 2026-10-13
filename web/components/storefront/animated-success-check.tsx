"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedSuccessCheck() {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="relative w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20"
      >
        <svg
          className="w-12 h-12 stroke-current"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <motion.path
            d="m8 12.5 2.8 2.8 5.4-5.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.4, ease: "easeOut" }}
          />
        </svg>

        {/* Lightweight celebratory confetti bursts */}
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + (i * 8))],
              y: [0, -15 - (i * 6)],
            }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.05 }}
            className={`absolute w-2 h-2 rounded-full ${
              i % 3 === 0
                ? "bg-amber-400"
                : i % 3 === 1
                ? "bg-brand-500"
                : "bg-emerald-400"
            }`}
          />
        ))}
      </motion.div>
    </div>
  );
}
