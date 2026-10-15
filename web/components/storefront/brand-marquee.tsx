"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { Container } from "@/components/ui/container";

interface BrandItem {
  name: string;
  count: string;
}

interface BrandMarqueeProps {
  brands: BrandItem[];
}

export function BrandMarquee({ brands }: BrandMarqueeProps) {
  // Duplicate brands array to make a seamless infinite loop
  const marqueeItems = [...brands, ...brands, ...brands, ...brands];
  const viewportRef = useRef<HTMLDivElement>(null);
  // Pause the CSS transform animation while the strip is offscreen.
  const inView = useInView(viewportRef);

  return (
    <section className="py-6 border-b border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden bg-white/50 dark:bg-zinc-950/50">
      <Container className="mb-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          Trusted Brand Partners • Hover to Pause
        </span>
      </Container>

      {/* Marquee viewport */}
      <div
        ref={viewportRef}
        className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
      >
        <div
          className="flex w-max gap-4 animate-marquee will-change-transform hover:[animation-play-state:paused]"
          style={inView ? undefined : { animationPlayState: "paused" }}
        >
          {marqueeItems.map((b, idx) => (
            <Link
              key={`${b.name}-${idx}`}
              href={`/shop?brand=${encodeURIComponent(b.name)}`}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 transition-all cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <span className="font-display text-xl sm:text-2xl font-black italic tracking-wider text-zinc-800 dark:text-zinc-200 group-hover:text-brand-500 transition-colors uppercase">
                {b.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-full border border-brand-200/60 dark:border-brand-800/60">
                {b.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
