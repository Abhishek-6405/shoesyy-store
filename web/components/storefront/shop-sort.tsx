"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select aria-label="Sort products"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none h-10 pl-3.5 pr-8 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="featured">Featured Drops</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Customer Rated</option>
        </select>
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 absolute right-3 top-3.5 pointer-events-none" />
      </div>
    </div>
  );
}
