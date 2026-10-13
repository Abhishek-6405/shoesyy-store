import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface Params {
  params: {
    productId: string;
  };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { productId } = params;

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
