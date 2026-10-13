"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard, ProductCardProps } from "@/components/storefront/product-card";

interface ShopProductGridProps {
  products: ProductCardProps[];
}

export function ShopProductGrid({ products }: ShopProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ProductCard {...p} priority={idx < 3} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
