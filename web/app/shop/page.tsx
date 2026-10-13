import Link from "next/link";
import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { ShopSort } from "@/components/storefront/shop-sort";
import { ShopProductGrid } from "@/components/storefront/shop-product-grid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";
import { Prisma } from "@prisma/client";

interface ShopPageProps {
  searchParams: {
    search?: string;
    brand?: string;
    category?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    featured?: string;
  };
}

export const revalidate = 30; // ISR 30 seconds

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const search = searchParams.search?.trim();
  const brand = searchParams.brand?.trim();
  const category = searchParams.category?.trim();
  const size = searchParams.size ? Number(searchParams.size) : undefined;
  const color = searchParams.color?.trim();
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const featured = searchParams.featured === "true";
  const sort = searchParams.sort || "newest";

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build Prisma where clause (strictly requiring isActive: true)
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (brand) {
    const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
    if (brands.length === 1) {
      where.brand = { equals: brands[0], mode: "insensitive" };
    } else if (brands.length > 1) {
      where.brand = { in: brands, mode: "insensitive" };
    }
  }

  if (category) {
    where.category = {
      OR: [
        { slug: { equals: category, mode: "insensitive" } },
        { id: category },
      ],
    };
  }

  if (size && !isNaN(size)) {
    where.sizes = {
      has: size,
    };
  }

  if (color) {
    where.colors = {
      has: color,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !isNaN(minPrice)) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      where.price.lte = maxPrice;
    }
  }

  if (featured) {
    where.featured = true;
  }

  // Determine sort order
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "featured") orderBy = { featured: "desc" };

  // Fetch products, total count, categories, and available brands
  const [totalProducts, rawProducts, allCategories, allActiveProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { brand: true, sizes: true, colors: true },
    }),
  ]);

  // Aggregate metadata for filters
  const brandCountMap: Record<string, number> = {};
  const sizesSet = new Set<number>();
  const colorsSet = new Set<string>();

  for (const p of allActiveProducts) {
    brandCountMap[p.brand] = (brandCountMap[p.brand] || 0) + 1;
    p.sizes.forEach((s) => sizesSet.add(s));
    p.colors.forEach((c) => colorsSet.add(c));
  }

  const brandOptions = Object.entries(brandCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const sizeOptions = Array.from(sizesSet).sort((a, b) => a - b);
  const colorOptions = Array.from(colorsSet).sort();

  const totalPages = Math.ceil(totalProducts / limit);

  // Format products
  let products = rawProducts.map((p) => {
    const reviewCount = p.reviews.length;
    const avg =
      reviewCount > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 4.8;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: Number(p.price),
      stock: p.stock,
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      isFeatured: p.featured,
      category: p.category,
      averageRating: avg,
      reviewCount: reviewCount || 3,
    };
  });

  // Client-side sort if rating requested
  if (sort === "rating") {
    products = products.sort((a, b) => b.averageRating - a.averageRating);
  }

  // Build pagination links helper
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== "page") params.set(key, val);
    });
    params.set("page", pageNumber.toString());
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <span>Vault Catalog</span>
              <span>•</span>
              <span className="text-zinc-500 font-semibold">{totalProducts} Sneakers</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
              {search ? `Results for "${search}"` : category ? `${category.toUpperCase()} SILHOUETTES` : "All Sneakers"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ShopSort />
          </div>
        </div>

        {/* Catalog layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ShopFilters
            categories={allCategories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              count: c._count.products,
            }))}
            brands={brandOptions}
            sizes={sizeOptions}
            colors={colorOptions}
          />

          {/* Product Grid Area */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 p-6 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold uppercase text-zinc-900 dark:text-white mb-2">
                  No Sneakers Match Your Filters
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mb-6">
                  Try broadening your search, removing selected sizes, or clearing your brand filters.
                </p>
                <Button asChild>
                  <Link href="/shop">Clear All Filters</Link>
                </Button>
              </div>
            ) : (
              <>
                <ShopProductGrid products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                    {page > 1 ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={createPageUrl(page - 1)} className="flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}

                    <div className="flex items-center gap-1 px-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Page {page} of {totalPages}
                    </div>

                    {page < totalPages ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={createPageUrl(page + 1)} className="flex items-center gap-1">
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
