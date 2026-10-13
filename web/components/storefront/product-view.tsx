"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name?: string | null;
    username: string;
  };
}

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    sizes: number[];
    colors: string[];
    isFeatured: boolean;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    reviews: ReviewItem[];
    averageRating: number;
    reviewCount: number;
  };
}

export function ProductView({ product }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error: toastError } = useToast();

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes?.[0] || 8);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "Default");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  // Reviews state
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(product.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const currentImage =
    product.images[selectedImageIndex] ||
    product.images[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    success(`Added UK ${selectedSize} ${product.name} to your bag`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    router.push("/checkout");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toastError("Please sign in to submit a review");
      router.push(`/login?callbackUrl=/products/${product.slug}`);
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit review");
      }

      success("Thank you! Your review has been published.");
      setReviewsList([
        {
          id: json.data?.id || Math.random().toString(),
          rating: newRating,
          comment: newComment,
          createdAt: new Date().toISOString(),
          user: {
            id: session.user.id || "",
            name: session.user.name || "Customer",
            username: (session.user as { username?: string }).username || "user",
          },
        },
        ...reviewsList,
      ]);
      setNewComment("");
      setActiveTab("reviews");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post review";
      toastError(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const hasUserReviewed = session?.user
    ? reviewsList.some((r) => r.user.id === session.user.id)
    : false;

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <span className="px-3 py-1 rounded-md bg-zinc-900/90 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
                {product.brand}
              </span>
              {product.isFeatured && (
                <Badge variant="brand" className="font-bold">
                  Featured Drop
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id, product.name)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md z-10 ${
                isSaved
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-950 dark:text-rose-400"
                  : "bg-white/90 text-zinc-600 hover:text-rose-500 dark:bg-zinc-900/90 dark:text-zinc-300"
              }`}
              aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  isSaved ? "fill-current" : ""
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? "border-brand-500 scale-95 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Brand */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              {product.category ? (
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-brand-500 transition-colors"
                >
                  {product.category.name}
                </Link>
              ) : (
                <span>Sneakers</span>
              )}

              {/* Stock Status */}
              <div>
                {isOutOfStock ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : product.stock <= 5 ? (
                  <Badge variant="warning">Only {product.stock} left in stock</Badge>
                ) : (
                  <Badge variant="success">In Stock ({product.stock} available)</Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.averageRating)
                        ? "fill-current"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400">
                ({reviewsList.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400 uppercase font-semibold block">
                Price (inclusive of all taxes)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-4xl font-black text-zinc-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Free Express Delivery
                </span>
              </div>
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Colorway: <span className="font-normal text-zinc-500">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedColor === c
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                <span>Select Size (UK)</span>
                <span className="text-zinc-400 font-semibold cursor-pointer hover:underline">
                  Size Guide
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s)}
                      className={`h-11 rounded-xl text-xs font-black border transition-all ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20 scale-[1.02]"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      UK {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Quantity
              </span>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                <button
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-zinc-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                size="lg"
                className="w-full h-14 text-base font-bold shadow-xl shadow-brand-500/20"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {isOutOfStock ? "Sold Out" : `Add to Bag • ${formatPrice(product.price * quantity)}`}
              </Button>

              <Button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                variant="dark"
                size="lg"
                className="w-full h-13 font-bold"
              >
                <Zap className="w-4 h-4 mr-2 text-brand-500 fill-current" />
                Instant Checkout (COD / Online)
              </Button>
            </div>

            {/* Value markers */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                <Truck className="w-5 h-5 mx-auto text-brand-500 mb-1" />
                <span className="text-[10px] font-bold uppercase block text-zinc-700 dark:text-zinc-300">
                  Free Shipping
                </span>
                <span className="text-[9px] text-zinc-400">All India</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                <ShieldCheck className="w-5 h-5 mx-auto text-brand-500 mb-1" />
                <span className="text-[10px] font-bold uppercase block text-zinc-700 dark:text-zinc-300">
                  Authentic
                </span>
                <span className="text-[9px] text-zinc-400">Verified Drop</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                <RotateCcw className="w-5 h-5 mx-auto text-brand-500 mb-1" />
                <span className="text-[10px] font-bold uppercase block text-zinc-700 dark:text-zinc-300">
                  Easy Return
                </span>
                <span className="text-[9px] text-zinc-400">30-Day Window</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-8 mb-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "description"
                ? "text-brand-500"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Description & Specs
            {activeTab === "description" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "reviews"
                ? "text-brand-500"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Customer Reviews ({reviewsList.length})
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500" />
            )}
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === "description" && (
          <div className="max-w-3xl space-y-6 text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm">
            <p className="text-base text-zinc-800 dark:text-zinc-200 font-medium">
              {product.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-zinc-400">Brand</span>
                <p className="font-semibold text-zinc-900 dark:text-white">{product.brand}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-zinc-400">Category</span>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {product.category?.name || "Sneakers"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-zinc-400">Available Sizes</span>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  UK {product.sizes.join(", ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-zinc-400">Color Palette</span>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {product.colors.join(" / ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsList.length === 0 ? (
                <p className="text-sm text-zinc-500 italic py-6">
                  No reviews yet for this sneaker. Be the first to leave one!
                </p>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                          {rev.user.name?.[0]?.toUpperCase() || rev.user.username[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {rev.user.name || rev.user.username}
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-semibold">
                          Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>

                    {rev.comment && (
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <h3 className="text-base font-bold uppercase text-zinc-900 dark:text-white mb-2">
                  Write a Review
                </h3>
                {!session?.user ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-zinc-500">
                      Sign in to your Shoesy account to leave a verified rating and review.
                    </p>
                    <Button size="sm" asChild>
                      <Link href={`/login?callbackUrl=/products/${product.slug}`}>
                        Sign In to Review
                      </Link>
                    </Button>
                  </div>
                ) : hasUserReviewed ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>You have already submitted your review for this sneaker.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold ml-2 text-zinc-700 dark:text-zinc-300">
                          {newRating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        Review Comments
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell the community how they fit, feel on foot, and look in real life..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full font-bold text-xs"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
