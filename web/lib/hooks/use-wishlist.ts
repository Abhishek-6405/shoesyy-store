"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";
import { useWishlistStore } from "@/lib/store/wishlist";

export function useWishlist() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const { success, error: toastError } = useToast();

  const wishlistProductIds = useWishlistStore((s) => s.ids);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const load = useWishlistStore((s) => s.load);
  const setSaved = useWishlistStore((s) => s.setSaved);

  // Keyed on the user id (a string), not the session object, so session refreshes
  // don't refetch. The store dedupes across all mounted hooks.
  useEffect(() => {
    if (status === "loading") return;
    load(userId);
  }, [userId, status, load]);

  const fetchWishlist = useCallback(() => load(userId, true), [load, userId]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistProductIds.has(productId),
    [wishlistProductIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      if (!userId) {
        toastError("Please sign in to save items to your wishlist");
        return false;
      }

      const isSaved = useWishlistStore.getState().ids.has(productId);

      // Optimistic update
      setSaved(productId, !isSaved);

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
        setSaved(productId, isSaved);
        toastError("Could not update wishlist. Please try again.");
        return false;
      }
    },
    [userId, setSaved, success, toastError]
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
