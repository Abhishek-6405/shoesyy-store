"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopFiltersProps {
  categories: { id: string; name: string; slug: string; count: number }[];
  brands: { name: string; count: number }[];
  sizes: number[];
  colors: string[];
}

export function ShopFilters({
  categories,
  brands,
  sizes,
  colors,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentBrands = searchParams.get("brand") ? searchParams.get("brand")!.split(",") : [];
  const currentSize = searchParams.get("size") || "";
  const currentColor = searchParams.get("color") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentFeatured = searchParams.get("featured") || "";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // reset pagination on filter change

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/shop?${params.toString()}`);
  };

  const handleBrandToggle = (brandName: string) => {
    let nextBrands: string[];
    if (currentBrands.includes(brandName)) {
      nextBrands = currentBrands.filter((b) => b !== brandName);
    } else {
      nextBrands = [...currentBrands, brandName];
    }
    updateFilters({ brand: nextBrands.length > 0 ? nextBrands.join(",") : null });
  };

  const handleClearAll = () => {
    router.push("/shop");
    setIsMobileOpen(false);
  };

  const hasActiveFilters = Boolean(
    currentCategory ||
      currentBrands.length > 0 ||
      currentSize ||
      currentColor ||
      currentMinPrice ||
      currentMaxPrice ||
      currentSearch ||
      currentFeatured
  );

  const FilterContent = (
    <div className="space-y-6">
      {/* Active filters & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Active Filters
          </span>
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
              !currentCategory
                ? "bg-brand-500 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilters({ category: currentCategory === c.slug ? null : c.slug })}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                currentCategory === c.slug
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{c.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  currentCategory === c.slug
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Brand
        </h3>
        <div className="space-y-2">
          {brands.map((b) => {
            const isChecked = currentBrands.includes(b.name);
            return (
              <label
                key={b.name}
                className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-brand-500 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => handleBrandToggle(b.name)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span onClick={() => handleBrandToggle(b.name)}>{b.name}</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-normal">
                  ({b.count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Size (UK)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((s) => {
            const isSelected = currentSize === s.toString();
            return (
              <button
                key={s}
                onClick={() => updateFilters({ size: isSelected ? null : s.toString() })}
                className={`h-9 rounded-lg text-xs font-bold border transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
                }`}
              >
                UK {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
            Color
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => {
              const isSelected = currentColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => updateFilters({ color: isSelected ? null : c })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 bg-white dark:bg-zinc-900"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Price Range (₹)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={currentMinPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value || null })}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Max Price</label>
            <input
              type="number"
              placeholder="25000"
              value={currentMaxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value || null })}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 font-bold text-xs"
        >
          <Filter className="w-4 h-4 text-brand-500" />
          Filter Kicks
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          )}
        </Button>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 pr-6">
        <div className="sticky top-28 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          {FilterContent}
        </div>
      </div>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white dark:bg-zinc-950 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-brand-500" />
                    <h2 className="text-base font-bold uppercase">Filters</h2>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {FilterContent}
              </div>

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <Button
                  className="w-full font-bold"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
