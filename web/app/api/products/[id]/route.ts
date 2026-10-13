import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse("Product identifier is required", 400);
    }

    // Lookup by ID or by slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, username: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0;

    return successResponse({
      ...product,
      price: Number(product.price),
      reviewCount,
      averageRating,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
