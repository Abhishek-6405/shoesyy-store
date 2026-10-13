import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateOrderStatusSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, ApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/catalog";
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

    // Enforce valid forward moves and cancellation rules:
    // PENDING -> PROCESSING or CANCELLED
    // PROCESSING -> SHIPPED or CANCELLED
    // SHIPPED -> DELIVERED or CANCELLED
    // DELIVERED and CANCELLED are final.
    if (validated.status !== existingOrder.status) {
      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        SHIPPED: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        DELIVERED: [],
        CANCELLED: [],
      };

      const allowed = allowedTransitions[existingOrder.status] || [];
      if (!allowed.includes(validated.status)) {
        if (existingOrder.status === OrderStatus.DELIVERED || existingOrder.status === OrderStatus.CANCELLED) {
          return errorResponse(
            `Order ${existingOrder.orderNumber} is already ${existingOrder.status} and cannot be modified.`,
            400
          );
        }
        return errorResponse(
          `Invalid transition from ${existingOrder.status} to ${validated.status}. Orders can only progress forward (PENDING → PROCESSING → SHIPPED → DELIVERED) or be cancelled.`,
          400
        );
      }
    }

    // Compare-and-set on the current status, so concurrent requests cannot both
    // apply the transition (and stock is restored at most once on cancellation).
    const updated = await prisma.$transaction(async (tx) => {
      const freshOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!freshOrder) {
        throw new ApiError("Order not found", 404);
      }

      if (freshOrder.status === OrderStatus.DELIVERED || freshOrder.status === OrderStatus.CANCELLED) {
        throw new ApiError(
          `Order ${freshOrder.orderNumber} is already ${freshOrder.status} and cannot be modified.`,
          409
        );
      }

      const { count } = await tx.order.updateMany({
        where: { id, status: freshOrder.status },
        data: { status: validated.status },
      });

      if (count !== 1) {
        throw new ApiError("Order status was changed by another request. Please refresh and try again.", 409);
      }

      if (validated.status === OrderStatus.CANCELLED) {
        for (const item of freshOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
    });

    revalidateCatalog();

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
