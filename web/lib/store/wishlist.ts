"use client";

import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  loadedFor: string | null;
  isLoading: boolean;
  load: (userId: string | null, force?: boolean) => Promise<void>;
  setSaved: (productId: string, saved: boolean) => void;
}

let inflight: { userId: string; promise: Promise<void> } | null = null;

// Not persisted: the server is the source of truth; this only dedupes requests
// so every ProductCard and the navbar share one /api/wishlist call.
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: new Set<string>(),
  loadedFor: null,
  isLoading: false,
  load: async (userId, force = false) => {
    if (!userId) {
      inflight = null;
      set({ ids: new Set(), loadedFor: null, isLoading: false });
      return;
    }
    if (!force && get().loadedFor === userId) return;
    if (!force && inflight?.userId === userId) return inflight.promise;

    const promise = (async () => {
      set({ isLoading: true });
      try {
        const res = await fetch("/api/wishlist");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          set({
            ids: new Set<string>(json.data.map((item: { productId: string }) => item.productId)),
            loadedFor: userId,
          });
        }
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      } finally {
        set({ isLoading: false });
        inflight = null;
      }
    })();
    inflight = { userId, promise };
    return promise;
  },
  setSaved: (productId, saved) =>
    set((state) => {
      const next = new Set(state.ids);
      if (saved) next.add(productId);
      else next.delete(productId);
      return { ids: next };
    }),
}));
