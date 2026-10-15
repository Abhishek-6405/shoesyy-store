"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { athleticEasing } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface AdminStatCardsProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
}

function AnimatedCounter({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const start = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(value);
      }
    }

    const frameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(frameId);
  }, [value, shouldReduceMotion]);

  if (isCurrency) {
    return <span>{formatPrice(displayValue)}</span>;
  }
  return <span>{displayValue.toLocaleString()}</span>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: athleticEasing },
  },
};

export function AdminStatCards({
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalProducts,
  lowStockCount,
}: AdminStatCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {/* Total Revenue */}
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Total Revenue
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white">
          <AnimatedCounter value={totalRevenue} isCurrency />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Excludes cancelled orders
        </p>
      </motion.div>

      {/* Total Orders */}
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-500/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Total Orders
          </span>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white">
          <AnimatedCounter value={totalOrders} />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Across all payment methods</p>
      </motion.div>

      {/* Total Customers */}
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-sky-500/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Registered Customers
          </span>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white">
          <AnimatedCounter value={totalCustomers} />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Buyer accounts in database</p>
      </motion.div>

      {/* Total Products */}
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Catalog Items
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white">
          <AnimatedCounter value={totalProducts} />
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {lowStockCount > 0 ? (
            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} low in stock
            </span>
          ) : (
            <span className="text-xs text-emerald-500">Healthy stock levels</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
