import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { verifyRazorpayPaymentSchema } from "@/lib/validations";
import { verifyRazorpaySignature, razorpayInstance } from "@/lib/razorpay";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { placeOrder, serializeOrder } from "@/lib/orders";
import { revalidateCatalog } from "@/lib/catalog";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    if (!razorpayInstance) {
      return errorResponse("Razorpay is not configured on this server.", 503);
    }

    const body = await req.json();
    const validated = verifyRazorpayPaymentSchema.parse(body);

    // Verify cryptographic HMAC signature
    const isValidSignature = verifyRazorpaySignature(
      validated.razorpayOrderId,
      validated.razorpayPaymentId,
      validated.razorpaySignature
    );

    if (!isValidSignature) {
      return errorResponse(
        "Invalid payment signature. Payment verification failed.",
        400
      );
    }

    // Replay protection: one Razorpay order can only ever create one store order.
    const alreadyUsed = await prisma.order.findFirst({
      where: { razorpayOrderId: validated.razorpayOrderId },
      select: { id: true },
    });
    if (alreadyUsed) {
      return errorResponse("This payment has already been used for an order.", 409);
    }

    // The signature only proves the payment belongs to the Razorpay order; the amount
    // charged must also match the cart being ordered now.
    const rzpOrder = await razorpayInstance.orders.fetch(validated.razorpayOrderId);

    const finalOrder = await placeOrder({
      userId: user.id,
      email: user.email || "",
      items: validated.orderData.items,
      shippingAddress: validated.orderData.shippingAddress,
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.PROCESSING,
      orderNumberPrefix: "ORD-RZP",
      razorpayOrderId: validated.razorpayOrderId,
      razorpayPaymentId: validated.razorpayPaymentId,
      expectedAmountPaise: Number(rzpOrder.amount),
    });

    revalidateCatalog();
    return successResponse(serializeOrder(finalOrder), 201);
  } catch (err) {
    return handleApiError(err);
  }
}
