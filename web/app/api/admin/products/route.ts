import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const brand = searchParams.get("brand")?.trim();
    const category = searchParams.get("category")?.trim();
    const productStatus = searchParams.get("status")?.trim() || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (productStatus === "active") {
      where.isActive = true;
    } else if (productStatus === "inactive") {
      where.isActive = false;
    }

    if (brand && brand !== "all") {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (category && category !== "all") {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Determine orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "stock-asc") orderBy = { stock: "asc" };
    else if (sort === "stock-desc") orderBy = { stock: "desc" };
    else if (sort === "name-asc") orderBy = { name: "asc" };

    const [total, products, allBrandsRaw, categories] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.findMany({
        select: { brand: true },
        distinct: ["brand"],
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));

    const brands = allBrandsRaw.map((b) => b.brand).sort();

    return successResponse({
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      brands,
      categories,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const body = await req.json();
    const validated = productSchema.parse(body);

    // Generate unique slug if not explicitly passed
    let finalSlug = validated.slug ? slugify(validated.slug) : slugify(validated.name);

    // Verify slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: validated.categoryId },
    });

    if (!categoryExists) {
      return errorResponse("Selected category does not exist", 404);
    }

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        slug: finalSlug,
        description: validated.description,
        price: validated.price,
        brand: validated.brand,
        categoryId: validated.categoryId,
        images: validated.images,
        sizes: validated.sizes,
        colors: validated.colors,
        stock: validated.stock,
        featured: validated.featured,
        isActive: validated.isActive !== undefined ? validated.isActive : true,
      },
      include: {
        category: true,
      },
    });

    return successResponse(
      {
        ...product,
        price: Number(product.price),
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
