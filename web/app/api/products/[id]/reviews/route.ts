import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const reviews = await prisma.review.findMany({
      where: {
        OR: [{ productId: id }, { product: { slug: id } }],
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;

    // Find the product by ID or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const body = await req.json();
    const validated = reviewSchema.parse({
      ...body,
      productId: product.id,
    });

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: user.id,
      },
    });

    if (existingReview) {
      return errorResponse("You have already reviewed this product. Only one review per user is permitted.", 409);
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: validated.rating,
        comment: validated.comment,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    return successResponse(review, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
