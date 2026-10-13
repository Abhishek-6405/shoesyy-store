import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

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
