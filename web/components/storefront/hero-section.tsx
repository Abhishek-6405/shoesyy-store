"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax transform on scroll (disabled if reduced motion)
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const accentRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  const headlineWords = ["Unleash", "Your", "Stride."];

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900/80 dark:to-zinc-950 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-zinc-200/60 dark:border-zinc-800/60"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill badge */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 text-xs font-bold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Drop Collection 2026 • Live Now
            </motion.div>

            {/* Staggered headline word reveal */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white leading-[0.95] flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-1">
              {headlineWords.map((word, idx) => (
                <motion.span
                  key={word}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 28, filter: "blur(4px)" }
                  }
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={word === "Stride." ? "text-brand-500" : ""}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Step into the culture with curated authentic sneakers from Nike,
              Adidas, Puma, and Asics. Engineered for comfort, designed for the streets.
            </motion.p>

            {/* Action Buttons with Micro-interactions */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-xl shadow-brand-500/25"
                >
                  <Link href="/shop" className="flex items-center justify-center gap-2">
                    Shop New Drops
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold"
                >
                  <Link href="/shop?featured=true">View Featured</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust markers */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-3 gap-4 text-center lg:text-left"
            >
              <div>
                <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  26+
                </span>
                <span className="text-xs text-zinc-500 block font-medium">
                  Iconic Silhouette Styles
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  100%
                </span>
                <span className="text-xs text-zinc-500 block font-medium">
                  Verified Authentic
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  FREE
                </span>
                <span className="text-xs text-zinc-500 block font-medium">
                  Shipping Over ₹2,000
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image Showcase with Parallax, Floating Loop, and Animated Accent */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-lg">
              {/* Animated Accent Shape behind the shoe */}
              <motion.div
                style={shouldReduceMotion ? {} : { rotate: accentRotate }}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: [0.95, 1.05, 0.95],
                        opacity: [0.35, 0.55, 0.35],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-amber-500 rounded-full blur-3xl transform -rotate-12"
              />

              {/* Floating Showcase Container */}
              <motion.div
                style={shouldReduceMotion ? {} : { y: imageY }}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [-6, 6, -6],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 shadow-2xl"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
                  <Image
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=85"
                    alt="Featured Sneaker Drop"
                    fill
                    priority
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                </div>

                {/* Floating Product Badge */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 block">
                      Trending Drop
                    </span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      Nike Air Max 90 Infrared
                    </p>
                  </div>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    ₹11,999
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
