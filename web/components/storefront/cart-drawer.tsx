"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useCartDetails } from "@/lib/hooks/use-cart-details";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const pathname = usePathname();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const {
    items,
    isLoading,
    subtotal,
    shipping,
    grandTotal,
    shippingThreshold,
    amountNeededForFreeShipping,
  } = useCartDetails();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const shippingPct = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop with Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer with Spring Slide */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-screen max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-bold tracking-tight uppercase">Your Bag</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress with Animated Width */}
            {items.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span>
                    {amountNeededForFreeShipping === 0 ? (
                      <span className="text-emerald-600 font-semibold">
                        🎉 You unlocked FREE Delivery!
                      </span>
                    ) : (
                      <>
                        Add <strong className="text-brand-600">{formatPrice(amountNeededForFreeShipping)}</strong> for Free Delivery
                      </>
                    )}
                  </span>
                  <span className="text-zinc-400 font-semibold">{shippingPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items List with AnimatePresence & Staggered Line Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl animate-pulse"
                    >
                      <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 text-zinc-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Your bag is empty</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mb-6">
                    Looks like you haven&apos;t added any sneakers to your bag yet.
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item, idx) => {
                    const product = item.product;
                    const imageSrc =
                      product?.images?.[0] ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";

                    return (
                      <motion.div
                        key={`${item.productId}-${item.size}-${item.color || ""}`}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                        className="flex gap-4 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors overflow-hidden"
                      >
                        <div className="relative w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                          <Image
                            src={imageSrc}
                            alt={product?.name || "Shoe product"}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={product ? `/products/${product.slug}` : "/shop"}
                                onClick={closeCart}
                                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate hover:text-brand-500 transition-colors"
                              >
                                {product?.name || "Loading product..."}
                              </Link>
                              <button
                                onClick={() => removeItem(item.productId, item.size, item.color)}
                                className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Size: <span className="font-semibold text-zinc-800 dark:text-zinc-200">UK {item.size}</span>
                              {item.color && (
                                <> • Color: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.color}</span></>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.quantity - 1,
                                    item.color
                                  )
                                }
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="px-2.5 text-xs font-semibold overflow-hidden min-w-[20px] text-center">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={item.quantity}
                                    initial={{ y: -8, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 8, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="inline-block"
                                  >
                                    {item.quantity}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.quantity + 1,
                                    item.color
                                  )
                                }
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                              {formatPrice(item.itemTotal)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Total</span>
                    <span className="text-brand-600 text-lg">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full text-base font-bold h-12" asChild onClick={closeCart}>
                    <Link href="/checkout" className="flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold"
                    asChild
                    onClick={closeCart}
                  >
                    <Link href="/cart">View Full Bag</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
