"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useCartDetails } from "@/lib/hooks/use-cart-details";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    isLoading,
    subtotal,
    shipping,
    grandTotal,
    shippingThreshold,
    amountNeededForFreeShipping,
    totalItemCount,
  } = useCartDetails();

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  if (isLoading) {
    return (
      <div className="py-12 sm:py-20">
        <Container className="space-y-6 max-w-4xl">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-48 animate-pulse" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 sm:py-32">
        <Container className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Your Bag is Empty
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 mb-8 leading-relaxed">
            You don&apos;t have any sneakers saved in your shopping bag. Explore our latest drops and find your next pair.
          </p>
          <Button size="lg" asChild className="h-13 px-8 font-bold">
            <Link href="/shop" className="flex items-center gap-2">
              Browse Sneakers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-14">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">
              Checkout Bag
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
              Shopping Bag ({totalItemCount})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 self-start sm:self-auto"
          >
            Clear Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free shipping banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>
                  {amountNeededForFreeShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">
                      🎉 Free Express Shipping unlocked!
                    </span>
                  ) : (
                    <>
                      Add <strong className="text-brand-600">{formatPrice(amountNeededForFreeShipping)}</strong> more to get Free Delivery
                    </>
                  )}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {Math.min(100, Math.round((subtotal / shippingThreshold) * 100))}%
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {items.map((item, idx) => {
                const product = item.product;
                const imageSrc =
                  product?.images?.[0] ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";

                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                    className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                        <Image
                          src={imageSrc}
                          alt={product?.name || "Shoe"}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">
                          {product?.brand || "Brand"}
                        </span>
                        <Link
                          href={product ? `/products/${product.slug}` : "/shop"}
                          className="block text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 transition-colors"
                        >
                          {product?.name || "Product"}
                        </Link>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Size: <span className="font-bold text-zinc-800 dark:text-zinc-200">UK {item.size}</span>
                          {item.color && (
                            <> • Color: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.color}</span></>
                          )}
                        </p>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {formatPrice(item.unitPrice)} each
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                      {/* Stepper */}
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1, item.color)
                          }
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1, item.color)
                          }
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="text-base font-black text-zinc-900 dark:text-white">
                          {formatPrice(item.itemTotal)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 p-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-md space-y-6 sticky top-28">
              <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Estimated Delivery</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-black text-zinc-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-2xl text-brand-600">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button size="lg" className="w-full h-14 font-bold text-base shadow-xl shadow-brand-500/20" asChild>
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                <Button variant="outline" className="w-full font-semibold" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
                  <span>Dispatched in 24 hours across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
                  <span>100% Verified Authentic Sneakers</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
