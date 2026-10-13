import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Only allow the order owner or an ADMIN to view the order
    if (order.userId !== user.id && user.role !== Role.ADMIN) {
      return errorResponse("Forbidden. You do not have permission to view this order.", 403);
    }

    return successResponse({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
