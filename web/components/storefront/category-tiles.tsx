"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Container } from "@/components/ui/container";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count: {
    products: number;
  };
}

interface CategoryTilesProps {
  categories: CategoryItem[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <section>
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Explore By Category
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Find Your Silhouette
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group"
          >
            View All Categories
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block h-64 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
              >
                <Image
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
                  }
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/95 transition-colors" />

                <div className="absolute inset-x-4 bottom-4 text-white flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-black uppercase italic leading-none">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-semibold text-zinc-300 mt-1 block">
                      {cat._count.products}{" "}
                      {cat._count.products === 1 ? "Pair" : "Pairs"} Available
                    </span>
                  </div>

                  {/* Sliding arrow */}
                  <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center transform translate-x-1 group-hover:translate-x-0 group-hover:bg-brand-500 transition-[transform,background-color] duration-300">
                    <ArrowRight className="w-4 h-4 text-white transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
