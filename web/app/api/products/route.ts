import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim();
    const ids = searchParams.get("ids")?.split(",").map((i) => i.trim()).filter(Boolean);
    const brand = searchParams.get("brand")?.trim();
    const category = searchParams.get("category")?.trim();
    const size = searchParams.get("size") ? Number(searchParams.get("size")) : undefined;
    const color = searchParams.get("color")?.trim();
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Specific product IDs filter (useful for cart/checkout price revalidation)
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    // Search query
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Brand filter (supports comma-separated brands e.g. "Nike,Adidas")
    if (brand) {
      const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        where.brand = { equals: brands[0], mode: "insensitive" };
      } else if (brands.length > 1) {
        where.brand = { in: brands, mode: "insensitive" };
      }
    }

    // Category filter by slug or ID
    if (category) {
      where.category = {
        OR: [
          { slug: { equals: category, mode: "insensitive" } },
          { id: category },
        ],
      };
    }

    // Size filter (array contains size)
    if (size && !isNaN(size)) {
      where.sizes = {
        has: size,
      };
    }

    // Color filter
    if (color) {
      where.colors = {
        hasSome: [color],
      };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        where.price.lte = maxPrice;
      }
    }

    // Featured toggle
    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true" || featured === "1";
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "popular":
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
    ]);

    // Attach computed rating & review count
    const formattedProducts = products.map((prod) => {
      const reviewCount = prod.reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
          : 5.0;

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: Number(prod.price),
        brand: prod.brand,
        categoryId: prod.categoryId,
        category: prod.category,
        images: prod.images,
        sizes: prod.sizes,
        colors: prod.colors,
        stock: prod.stock,
        featured: prod.featured,
        createdAt: prod.createdAt,
        updatedAt: prod.updatedAt,
        reviewCount,
        averageRating,
      };
    });

    return successResponse({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
