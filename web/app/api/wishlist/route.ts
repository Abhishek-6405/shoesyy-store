import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";

const wishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export async function GET() {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const items = await prisma.wishlist.findMany({
      where: {
        userId: user.id,
        product: { isActive: true },
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = items.map((w) => ({
      id: w.id,
      productId: w.productId,
      createdAt: w.createdAt,
      product: {
        ...w.product,
        price: Number(w.product.price),
      },
    }));

    return successResponse(formatted);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const body = await req.json();
    const validated = wishlistSchema.parse(body);

    const product = await prisma.product.findFirst({
      where: {
        id: validated.productId,
        isActive: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found or unavailable", 404);
    }

    const item = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: validated.productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId: validated.productId,
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return successResponse(
      {
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return successResponse({ message: "Product removed from wishlist", productId });
  } catch (err) {
    return handleApiError(err);
  }
}
