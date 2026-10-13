"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useCartStore } from "@/lib/store/cart";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  images: string[];
  sizes: number[];
  colors?: string[];
  isFeatured?: boolean;
  category?: {
    name: string;
    slug: string;
  };
  averageRating?: number;
  reviewCount?: number;
  priority?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  brand,
  price,
  stock,
  images,
  sizes,
  colors,
  category,
  averageRating = 4.8,
  reviewCount = 5,
  priority = false,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const isSaved = isInWishlist(id);
  const primaryImage =
    images?.[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";
  const secondaryImage = images?.[1];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) return;
    const defaultSize = sizes?.[0] || 8;
    const defaultColor = colors?.[0];
    addItem({
      productId: id,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id, name);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-brand-500/5 transition-shadow duration-300"
    >
      {/* Top badges & Wishlist */}
      <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden">
        <Link href={`/products/${slug}`} className="block w-full h-full relative">
          {/* Primary image */}
          <Image
            src={primaryImage}
            alt={name}
            fill
            priority={priority}
            className={`object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              secondaryImage ? "group-hover:opacity-0" : ""
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Secondary image crossfade on hover */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${name} alternate view`}
              fill
              className="object-cover object-center transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </Link>

        {/* Brand & Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-zinc-900/80 text-white backdrop-blur-md">
            {brand}
          </span>
          {stock <= 5 && stock > 0 && (
            <Badge variant="warning" className="text-[10px] py-0 px-2 animate-pulse">
              Only {stock} left
            </Badge>
          )}
          {stock === 0 && (
            <Badge variant="destructive" className="text-[10px] py-0 px-2">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Animated Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors duration-200 z-10 ${
            isSaved
              ? "bg-rose-50 text-rose-500 shadow-sm dark:bg-rose-950/80 dark:text-rose-400"
              : "bg-white/80 text-zinc-600 hover:text-rose-500 hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:text-rose-400"
          }`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isSaved ? "saved" : "unsaved"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-current text-rose-500" : ""}`}
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Quick Add Button sliding up on hover (and visible on keyboard focus) */}
        {stock > 0 && (
          <div className="absolute inset-x-3 bottom-3 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 transition-all duration-200 ease-out z-10">
            <button
              onClick={handleQuickAdd}
              className={`w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                justAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Quick Add (UK {sizes?.[0] || 8})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {category && (
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {category.name}
            </span>
          )}
          <Link
            href={`/products/${slug}`}
            className="block text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors line-clamp-1 mt-0.5"
          >
            {name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[11px] text-zinc-400">({reviewCount})</span>
          </div>
        </div>

        {/* Price & Size details */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Price</span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {formatPrice(price)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block">Sizes</span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              UK {sizes?.[0]}-{sizes?.[sizes.length - 1]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
