import { unstable_cache, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const CATALOG_TAG = "catalog";
export const CATALOG_REVALIDATE_SECONDS = 60;

/** Call after any mutation that changes what the public storefront shows. */
export function revalidateCatalog() {
  try {
    revalidateTag(CATALOG_TAG);
  } catch (err) {
    console.error("Failed to revalidate catalog cache", err);
  }
}

const cacheOptions = { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS };

const categoryRef = { select: { id: true, name: true, slug: true } } as const;

// Only the columns a product card needs. Ratings come back as a small array of ints
// in the same query (relationJoins), which is cheaper than an extra aggregate round-trip.
const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  stock: true,
  images: true,
  sizes: true,
  colors: true,
  featured: true,
  category: categoryRef,
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

function averageRating(reviews: { rating: number }[]) {
  return reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 4.8;
}

function toCard(p: ProductCardRow) {
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
    averageRating: averageRating(p.reviews),
    reviewCount: p.reviews.length || 3,
  };
}

export type ProductCardData = ReturnType<typeof toCard>;

const categoriesWithCountsQuery = () =>
  prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      createdAt: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { name: "asc" },
  });

export const getCategoriesWithCounts = unstable_cache(
  async () => {
    const categories = await categoriesWithCountsQuery();
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count.products,
      createdAt: c.createdAt.toISOString(),
    }));
  },
  ["catalog-categories"],
  cacheOptions
);

export const getHomeData = unstable_cache(
  async () => {
    const [featured, trending, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, featured: true },
        select: productCardSelect,
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: productCardSelect,
        take: 4,
        orderBy: { stock: "desc" },
      }),
      categoriesWithCountsQuery(),
    ]);

    return {
      featured: featured.map(toCard),
      topRated: trending.map(toCard),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        _count: { products: c._count.products },
      })),
    };
  },
  ["catalog-home"],
  cacheOptions
);

export interface ShopFilters {
  search?: string;
  brand?: string;
  category?: string;
  size?: number;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort: string;
  page: number;
  limit: number;
}

function buildShopWhere(f: ShopFilters): Prisma.ProductWhereInput {
  // Inactive (soft-deleted) products are never shown on the storefront.
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (f.search) {
    where.OR = [
      { name: { contains: f.search, mode: "insensitive" } },
      { brand: { contains: f.search, mode: "insensitive" } },
      { description: { contains: f.search, mode: "insensitive" } },
    ];
  }

  if (f.brand) {
    const brands = f.brand.split(",").map((b) => b.trim()).filter(Boolean);
    if (brands.length === 1) {
      where.brand = { equals: brands[0], mode: "insensitive" };
    } else if (brands.length > 1) {
      where.brand = { in: brands, mode: "insensitive" };
    }
  }

  if (f.category) {
    where.category = {
      OR: [{ slug: { equals: f.category, mode: "insensitive" } }, { id: f.category }],
    };
  }

  if (f.size !== undefined && !isNaN(f.size)) {
    where.sizes = { has: f.size };
  }

  if (f.color) {
    where.colors = { has: f.color };
  }

  if (f.minPrice !== undefined || f.maxPrice !== undefined) {
    where.price = {};
    if (f.minPrice !== undefined && !isNaN(f.minPrice)) where.price.gte = f.minPrice;
    if (f.maxPrice !== undefined && !isNaN(f.maxPrice)) where.price.lte = f.maxPrice;
  }

  if (f.featured) {
    where.featured = true;
  }

  return where;
}

export const getShopProducts = unstable_cache(
  async (f: ShopFilters) => {
    const where = buildShopWhere(f);
    const skip = (f.page - 1) * f.limit;

    // Ratings are computed, not stored, so "rating" sorts the full filtered set
    // (small catalog) before paginating, instead of only reordering one page.
    if (f.sort === "rating") {
      const all = await prisma.product.findMany({
        where,
        select: productCardSelect,
        orderBy: { createdAt: "desc" },
      });
      const sorted = all.map(toCard).sort((a, b) => b.averageRating - a.averageRating);
      return { total: sorted.length, products: sorted.slice(skip, skip + f.limit) };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (f.sort === "price-asc") orderBy = { price: "asc" };
    else if (f.sort === "price-desc") orderBy = { price: "desc" };
    else if (f.sort === "featured") orderBy = { featured: "desc" };

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: productCardSelect,
        orderBy,
        skip,
        take: f.limit,
      }),
    ]);

    return { total, products: rows.map(toCard) };
  },
  ["catalog-shop-products"],
  cacheOptions
);

export const getShopFacets = unstable_cache(
  async () => {
    const [categories, brandGroups, variantRows] = await Promise.all([
      categoriesWithCountsQuery(),
      prisma.product.groupBy({
        by: ["brand"],
        where: { isActive: true },
        _count: { _all: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { sizes: true, colors: true },
      }),
    ]);

    const sizes = new Set<number>();
    const colors = new Set<string>();
    for (const p of variantRows) {
      p.sizes.forEach((s) => sizes.add(s));
      p.colors.forEach((c) => colors.add(c));
    }

    return {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
      brands: brandGroups
        .map((g) => ({ name: g.brand, count: g._count._all }))
        .sort((a, b) => b.count - a.count),
      sizes: Array.from(sizes).sort((a, b) => a - b),
      colors: Array.from(colors).sort(),
    };
  },
  ["catalog-shop-facets"],
  cacheOptions
);

export const getProductPageData = unstable_cache(
  async (slugOrId: string) => {
    const product = await prisma.product.findFirst({
      where: { isActive: true, OR: [{ slug: slugOrId }, { id: slugOrId }] },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        sizes: true,
        colors: true,
        featured: true,
        categoryId: true,
        category: categoryRef,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) return null;

    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { brand: { equals: product.brand, mode: "insensitive" } },
        ],
      },
      select: productCardSelect,
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    const reviewCount = product.reviews.length;

    return {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
        isFeatured: product.featured,
        category: product.category,
        reviews: product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        })),
        averageRating: averageRating(product.reviews),
        reviewCount,
      },
      related: related.map(toCard),
    };
  },
  ["catalog-product-page"],
  cacheOptions
);

export const getActiveProductSlugs = unstable_cache(
  async () => {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ["catalog-product-slugs"],
  cacheOptions
);
