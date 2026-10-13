import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { placeOrder, serializeOrder } from "@/lib/orders";
import { revalidateCatalog } from "@/lib/catalog";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(orders.map(serializeOrder));
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
    const validated = createOrderSchema.parse(body);

    // Online payments must go through /api/payments/razorpay/verify, which checks the
    // HMAC signature and the paid amount. Accepting them here would let a client mark
    // an unpaid order as paid.
    if (validated.paymentMethod !== PaymentMethod.COD) {
      return errorResponse(
        "Only Cash on Delivery orders can be placed here. Razorpay orders are created after payment verification.",
        400
      );
    }

    const createdOrder = await placeOrder({
      userId: user.id,
      email: user.email || "",
      items: validated.items,
      shippingAddress: validated.shippingAddress,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      orderNumberPrefix: "ORD",
    });

    revalidateCatalog();
    return successResponse(serializeOrder(createdOrder), 201);
  } catch (err) {
    return handleApiError(err);
  }
}
