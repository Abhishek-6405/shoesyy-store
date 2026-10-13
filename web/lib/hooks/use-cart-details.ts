"use client";

import { useEffect, useState, useMemo } from "react";
import { useCartStore, CartItem } from "@/lib/store/cart";
import { computeShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

export interface DetailedCartProduct {
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
    id: string;
    name: string;
    slug: string;
  };
}

export interface DetailedCartItem extends CartItem {
  product?: DetailedCartProduct;
  unitPrice: number;
  itemTotal: number;
  isAvailable: boolean;
}

type ProductsMap = Record<string, DetailedCartProduct>;

// Shared across all hook instances (cart drawer, cart page, checkout) so they
// reuse one request instead of each fetching the same products.
const CACHE_TTL_MS = 30_000;
const productCache = new Map<string, { at: number; promise: Promise<ProductsMap>; data?: ProductsMap }>();

function getCachedProducts(key: string): { fresh?: ProductsMap; promise: Promise<ProductsMap> } {
  const hit = productCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { fresh: hit.data, promise: hit.promise };
  }

  const entry: { at: number; promise: Promise<ProductsMap>; data?: ProductsMap } = {
    at: Date.now(),
    promise: Promise.resolve({}),
  };
  entry.promise = fetch(`/api/products?ids=${encodeURIComponent(key)}&limit=100`)
    .then((res) => res.json())
    .then((json) => {
      const map: ProductsMap = {};
      for (const p of json?.data?.products ?? []) {
        map[p.id] = p;
      }
      entry.data = map;
      return map;
    })
    .catch((err) => {
      productCache.delete(key);
      throw err;
    });
  productCache.set(key, entry);
  return { promise: entry.promise };
}

export function useCartDetails() {
  const items = useCartStore((state) => state.items);
  const [productsMap, setProductsMap] = useState<Record<string, DetailedCartProduct>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // A stable key so quantity/size changes don't trigger a refetch; only a change
  // in the set of products does.
  const productIdsKey = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.productId)))
      .filter(Boolean)
      .sort()
      .join(",");
  }, [items]);

  useEffect(() => {
    if (!mounted || !productIdsKey) {
      return;
    }

    let isCancelled = false;

    async function fetchFreshProductDetails() {
      const cached = getCachedProducts(productIdsKey);
      if (cached.fresh) {
        setProductsMap(cached.fresh);
        return;
      }
      setIsLoading(true);
      try {
        const map = await cached.promise;
        if (!isCancelled) {
          setProductsMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch fresh cart item details", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFreshProductDetails();

    return () => {
      isCancelled = true;
    };
  }, [productIdsKey, mounted]);

  const detailedItems: DetailedCartItem[] = useMemo(() => {
    if (!mounted) return [];
    return items.map((item) => {
      const product = productsMap[item.productId];
      const unitPrice = product ? Number(product.price) : 0;
      const isAvailable = Boolean(product && product.stock >= item.quantity);
      return {
        ...item,
        product,
        unitPrice,
        itemTotal: unitPrice * item.quantity,
        isAvailable,
      };
    });
  }, [items, productsMap, mounted]);

  const subtotal = useMemo(() => {
    return detailedItems.reduce((acc, curr) => acc + curr.itemTotal, 0);
  }, [detailedItems]);

  const shippingThreshold = FREE_SHIPPING_THRESHOLD;
  const shipping = computeShipping(subtotal);
  const grandTotal = subtotal + shipping;
  const totalItemCount = useMemo(() => {
    return items.reduce((acc, i) => acc + i.quantity, 0);
  }, [items]);

  return {
    items: detailedItems,
    rawItems: items,
    isLoading: !mounted || isLoading,
    subtotal,
    shipping,
    grandTotal,
    totalItemCount,
    shippingThreshold,
    amountNeededForFreeShipping: Math.max(0, shippingThreshold - subtotal),
  };
}
