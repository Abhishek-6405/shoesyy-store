"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  PowerOff,
  Power,
  Flame,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string | Date;
}

interface ProductsTableProps {
  products: ProductItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  brands: string[];
  categories: { id: string; name: string; slug: string }[];
  currentFilters: {
    search: string;
    brand: string;
    category: string;
    status: string;
    sort: string;
  };
}

export function ProductsTable({
  products: initialProducts,
  pagination,
  brands,
  categories,
  currentFilters,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState(currentFilters.search);
  const [productToDeactivate, setProductToDeactivate] = useState<ProductItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state if initialProducts changes
  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search.trim());
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/products?${params.toString()}`);
  };

  // Deactivate handler
  const handleConfirmDeactivate = async () => {
    if (!productToDeactivate) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/products/${productToDeactivate.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to deactivate product");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productToDeactivate.id ? { ...p, isActive: false } : p
        )
      );

      success(`Product "${productToDeactivate.name}" deactivated.`);
      setProductToDeactivate(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deactivating product";
      toastError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reactivate handler
  const handleReactivate = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to reactivate product");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: true } : p))
      );

      success(`Product "${product.name}" reactivated successfully!`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error reactivating product";
      toastError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Filters, Sort */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Input
              placeholder="Search kicks by title, brand, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={currentFilters.status || "all"}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Brand Filter */}
            <select
              value={currentFilters.brand || "all"}
              onChange={(e) => updateFilters("brand", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={currentFilters.category || "all"}
              onChange={(e) => updateFilters("category", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={currentFilters.sort || "newest"}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            {/* Clear Filters */}
            {(currentFilters.search ||
              (currentFilters.brand && currentFilters.brand !== "all") ||
              (currentFilters.category && currentFilters.category !== "all") ||
              (currentFilters.status && currentFilters.status !== "all")) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/products")}
                className="h-10 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Sneaker</th>
                <th className="py-3.5 px-4">Brand & Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                    No products found matching your current filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                        !product.isActive ? "opacity-60 bg-zinc-50/30 dark:bg-zinc-900/40" : ""
                      }`}
                    >
                      {/* Sneaker Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                            {product.images[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate max-w-[200px]">
                                {product.name}
                              </span>
                              {product.featured && (
                                <span title="Featured on home">
                                  <Flame className="w-3.5 h-3.5 text-brand-500 fill-brand-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px]">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                          {product.brand}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {product.category?.name || "Uncategorized"}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold ${
                              product.stock <= 5 ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {product.stock}
                          </span>
                          {product.stock <= 5 && (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {product.isActive ? (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                            Inactive
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live preview in storefront (only if active) */}
                          {product.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                              title="View on storefront"
                            >
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </Button>
                          )}

                          {/* Edit Product */}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-300 hover:text-brand-500"
                            title="Edit product"
                          >
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          </Button>

                          {/* Deactivate or Reactivate */}
                          {product.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDeactivate(product)}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Deactivate / Hide from storefront"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivate(product)}
                              className="h-8 px-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              title="Reactivate in storefront"
                            >
                              <Power className="w-3.5 h-3.5 mr-1" />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Showing{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {pagination.total}
              </span>{" "}
              products
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <span className="px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="h-8 px-2.5 text-xs"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Deactivate Confirm Modal Dialog */}
      {productToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <PowerOff className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Deactivate Product?
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Are you sure you want to deactivate{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  &ldquo;{productToDeactivate.name}&rdquo;
                </span>
                ? It will immediately disappear from the public storefront, search results, and category listings. Historical orders will remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductToDeactivate(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeactivate}
                disabled={isProcessing}
              >
                {isProcessing ? "Deactivating..." : "Deactivate Shoe"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
