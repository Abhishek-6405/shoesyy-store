"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    brand: string;
    categoryId: string;
    images: string[];
    sizes: number[];
    colors: string[];
    stock: number;
    featured: boolean;
    isActive: boolean;
  };
  categories: CategoryOption[];
  isEdit?: boolean;
}

const COMMON_SIZES = [6, 7, 8, 9, 10, 11, 12];
const COMMON_BRANDS = [
  "Nike",
  "Adidas",
  "Puma",
  "Asics",
  "New Balance",
  "Jordan",
  "Converse",
  "Vans",
];

type ProductFormValues = z.input<typeof productSchema>;

export function ProductForm({ initialData, categories, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic tags / list state
  const [newColorInput, setNewColorInput] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const defaultValues: ProductFormValues = {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price ? Number(initialData.price) : 9999,
    brand: initialData?.brand || "Nike",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    images: initialData?.images?.length
      ? initialData.images
      : [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
        ],
    sizes: initialData?.sizes?.length ? initialData.sizes : [7, 8, 9, 10],
    colors: initialData?.colors?.length ? initialData.colors : ["Black/White"],
    stock: initialData?.stock !== undefined ? initialData.stock : 15,
    featured: initialData?.featured || false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const watchedImages = watch("images") || [];
  const watchedSizes = watch("sizes") || [];
  const watchedColors = watch("colors") || [];
  const watchedName = watch("name");

  // Auto-generate slug when name changes (if creating or user hasn't heavily customized)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (!isEdit) {
      setValue("slug", slugify(val), { shouldValidate: true });
    }
  };

  // Toggle size
  const handleToggleSize = (size: number) => {
    const current = watchedSizes;
    if (current.includes(size)) {
      if (current.length === 1) {
        toastError("At least one size is required.");
        return;
      }
      setValue(
        "sizes",
        current.filter((s) => Number(s) !== size),
        { shouldValidate: true }
      );
    } else {
      setValue(
        "sizes",
        [...current, size].sort((a, b) => Number(a) - Number(b)),
        { shouldValidate: true }
      );
    }
  };

  // Add Color tag
  const handleAddColor = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    if (watchedColors.includes(trimmed)) {
      toastError("Color already exists.");
      return;
    }
    setValue("colors", [...watchedColors, trimmed], { shouldValidate: true });
    setNewColorInput("");
  };

  // Remove Color tag
  const handleRemoveColor = (colorToRemove: string) => {
    if (watchedColors.length === 1) {
      toastError("At least one color is required.");
      return;
    }
    setValue(
      "colors",
      watchedColors.filter((c) => c !== colorToRemove),
      { shouldValidate: true }
    );
  };

  // Add Image URL
  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      if (watchedImages.includes(trimmed)) {
        toastError("Image URL already added.");
        return;
      }
      setValue("images", [...watchedImages, trimmed], { shouldValidate: true });
      setNewImageUrl("");
    } catch {
      toastError("Please enter a valid HTTP/HTTPS image URL.");
    }
  };

  // Remove Image URL
  const handleRemoveImage = (index: number) => {
    if (watchedImages.length === 1) {
      toastError("At least one product image is required.");
      return;
    }
    setValue(
      "images",
      watchedImages.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      const endpoint = isEdit
        ? `/api/admin/products/${initialData?.id}`
        : `/api/admin/products`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to save product.");
      }

      success(
        isEdit
          ? `Product "${data.name}" updated successfully!`
          : `Product "${data.name}" created successfully!`
      );

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving product";
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="text-xs font-semibold gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : isEdit ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Core Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Details */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
              Product Information
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Product Title *
              </label>
              <Input
                placeholder="e.g. Nike Air Max 90 Ultra"
                {...register("name")}
                onChange={handleNameChange}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  URL Slug *
                </label>
                <button
                  type="button"
                  onClick={() => setValue("slug", slugify(watchedName || ""))}
                  className="text-[11px] font-bold text-brand-500 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <Input
                placeholder="e.g. nike-air-max-90-ultra"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs text-rose-500 mt-1">{errors.slug.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description *
              </label>
              <textarea
                rows={4}
                placeholder="Write compelling product specifications, material details, and athlete heritage..."
                {...register("description")}
                className="w-full p-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Card: Media & Images */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
                  Product Imagery
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  High-resolution photo URLs (Unsplash or hosted media)
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-500">
                {watchedImages.length} image{watchedImages.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Add Image URL bar */}
            <div className="flex gap-2">
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
                className="shrink-0 gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            {errors.images && (
              <p className="text-xs text-rose-500">{errors.images.message}</p>
            )}

            {/* Images Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {watchedImages.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 aspect-square"
                >
                  <Image
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-wider bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card: Sizes & Colors */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
              Variants & Sizing
            </h3>

            {/* UK Sizes Multi-Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Available UK Sizes (Click to toggle) *
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((sz) => {
                  const selected = watchedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                        selected
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      UK {sz}
                    </button>
                  );
                })}
              </div>
              {errors.sizes && (
                <p className="text-xs text-rose-500 mt-1">{errors.sizes.message}</p>
              )}
            </div>

            {/* Colors Tag Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Colorways *
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g. Triple Black, White/Gym Red"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddColor}
                  className="shrink-0 gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Color
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {watchedColors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="text-zinc-400 hover:text-rose-500 transition-colors"
                      aria-label={`Remove color ${color}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.colors && (
                <p className="text-xs text-rose-500 mt-1">{errors.colors.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Pricing, Inventory, Classification & Status (1 col) */}
        <div className="space-y-6">
          {/* Card: Status & Visibility */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
              Status & Visibility
            </h3>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div>
                <label className="text-xs font-bold text-zinc-900 dark:text-white block cursor-pointer">
                  Storefront Active
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Visible in public catalog and search
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
                  />
                )}
              />
            </div>

            {/* Featured Drop Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div>
                <label className="text-xs font-bold text-zinc-900 dark:text-white block cursor-pointer">
                  Featured Drop
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Spotlight on homepage hero and top carousels
                </p>
              </div>
              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
                  />
                )}
              />
            </div>
          </div>

          {/* Card: Price & Stock */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
              Pricing & Inventory
            </h3>

            {/* Price (INR) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Price (INR) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="9999"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Stock Quantity *
              </label>
              <Input
                type="number"
                placeholder="15"
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-xs text-rose-500 mt-1">{errors.stock.message}</p>
              )}
              <p className="text-[11px] text-zinc-400 mt-1">
                Products with &le; 5 units will trigger Low-Stock alerts.
              </p>
            </div>
          </div>

          {/* Card: Brand & Category */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
              Classification
            </h3>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Brand *
              </label>
              <select
                {...register("brand")}
                className="w-full h-10 px-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-brand-500 text-zinc-900 dark:text-zinc-100"
              >
                {COMMON_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.brand && (
                <p className="text-xs text-rose-500 mt-1">{errors.brand.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                {...register("categoryId")}
                className="w-full h-10 px-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-brand-500 text-zinc-900 dark:text-zinc-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
