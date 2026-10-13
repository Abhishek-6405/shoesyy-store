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
      {/* No `layout` here: measuring every card on each filter change is costly.
          Cards just fade/scale in and out (transform + opacity only). */}
      <AnimatePresence initial={true}>
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{
              duration: 0.3,
              delay: Math.min(idx, 8) * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ProductCard {...p} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
