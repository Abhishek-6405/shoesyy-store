import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateOrderStatusSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { OrderStatus } from "@prisma/client";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;
    const body = await req.json();
    const validated = updateOrderStatusSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return errorResponse("Order not found", 404);
    }

    // If order is transitioned to CANCELLED, restore item stocks
    const updated = await prisma.$transaction(async (tx) => {
      if (
        validated.status === OrderStatus.CANCELLED &&
        existingOrder.status !== OrderStatus.CANCELLED
      ) {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: validated.status },
        include: { items: true },
      });
    });

    return successResponse({
      ...updated,
      totalAmount: Number(updated.totalAmount),
      items: updated.items.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
