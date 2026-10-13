"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";

export function useWishlist() {
  const { data: session } = useSession();
  const { success, error: toastError } = useToast();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!session?.user) {
      setWishlistProductIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const ids = new Set<string>(json.data.map((item: { productId: string }) => item.productId));
        setWishlistProductIds(ids);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistProductIds.has(productId),
    [wishlistProductIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      if (!session?.user) {
        toastError("Please sign in to save items to your wishlist");
        return false;
      }

      const isSaved = wishlistProductIds.has(productId);

      // Optimistic update
      setWishlistProductIds((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        if (isSaved) {
          const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to remove item");
          success(productName ? `Removed ${productName} from wishlist` : "Removed from wishlist");
        } else {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          if (!res.ok) throw new Error("Failed to add item");
          success(productName ? `Added ${productName} to wishlist` : "Added to wishlist");
        }
        return true;
      } catch {
        // Rollback optimistic update
        setWishlistProductIds((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
        toastError("Could not update wishlist. Please try again.");
        return false;
      }
    },
    [session, wishlistProductIds, success, toastError]
  );

  return {
    wishlistCount: wishlistProductIds.size,
    wishlistProductIds,
    isInWishlist,
    toggleWishlist,
    isLoading,
    refresh: fetchWishlist,
  };
}
