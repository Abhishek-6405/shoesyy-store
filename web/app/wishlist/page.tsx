"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useToast } from "@/components/ui/toast";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: number;
    stock: number;
    images: string[];
    sizes: number[];
    colors: string[];
    category?: {
      name: string;
      slug: string;
    };
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { status } = useSession();
  const { success, error: toastError } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/wishlist");
      return;
    }

    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string, name: string) => {
    try {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
      success(`Removed ${name} from wishlist`);
    } catch {
      toastError("Could not remove item. Please try again.");
      fetchWishlist();
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    if (item.product.stock <= 0) {
      toastError("This sneaker is currently sold out");
      return;
    }

    const defaultSize = item.product.sizes?.[0] || 8;
    const defaultColor = item.product.colors?.[0];

    addItem({
      productId: item.product.id,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });

    await handleRemove(item.productId, item.product.name);
    success(`Moved ${item.product.name} (UK ${defaultSize}) to bag`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="py-16">
        <Container className="space-y-6">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-14">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-500">
              Personal Vault
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
              Saved Wishlist ({items.length})
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 sm:py-28 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-zinc-500 mt-2 mb-8 leading-relaxed">
              Save your favorite sneakers so you never miss a restock or price drop.
            </p>
            <Button size="lg" asChild className="h-13 px-8 font-bold">
              <Link href="/shop" className="flex items-center gap-2">
                Explore Kicks
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const p = item.product;
              const imageSrc =
                p.images?.[0] ||
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={imageSrc}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                      <button
                        onClick={() => handleRemove(item.productId, p.name)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-zinc-400 hover:text-rose-600 dark:bg-zinc-900/90 shadow-sm"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">
                        {p.brand}
                      </span>
                      <Link
                        href={`/products/${p.slug}`}
                        className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <p className="text-base font-black text-zinc-900 dark:text-white pt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => handleMoveToCart(item)}
                      disabled={p.stock <= 0}
                      className="w-full text-xs font-bold h-10"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                      {p.stock <= 0 ? "Out of Stock" : "Move to Bag"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
