"use client";

import { useEffect, useState, useMemo } from "react";
import { useCartStore, CartItem } from "@/lib/store/cart";

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

export function useCartDetails() {
  const items = useCartStore((state) => state.items);
  const [productsMap, setProductsMap] = useState<Record<string, DetailedCartProduct>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const productIds = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.productId))).filter(Boolean);
  }, [items]);

  useEffect(() => {
    if (!mounted || productIds.length === 0) {
      return;
    }

    let isCancelled = false;

    async function fetchFreshProductDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?ids=${productIds.join(",")}&limit=100`);
        const json = await res.json();
        if (json.success && json.data?.products) {
          const map: Record<string, DetailedCartProduct> = {};
          for (const p of json.data.products) {
            map[p.id] = p;
          }
          if (!isCancelled) {
            setProductsMap(map);
          }
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
  }, [productIds, mounted]);

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

  const shippingThreshold = 2000;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 150;
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
