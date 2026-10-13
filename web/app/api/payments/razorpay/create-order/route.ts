import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createRazorpayOrderSchema } from "@/lib/validations";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayKeyId,
} from "@/lib/razorpay";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    if (!isRazorpayConfigured) {
      return errorResponse(
        "Razorpay payment gateway is not configured on this server. Please choose Cash on Delivery.",
        503
      );
    }

    const body = await req.json();
    const validated = createRazorpayOrderSchema.parse(body);

    const productIds = validated.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let grandTotal = 0;

    for (const item of validated.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return errorResponse(`Product with ID "${item.productId}" no longer exists.`, 404);
      }
      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`,
          400
        );
      }
      grandTotal += Number(product.price) * item.quantity;
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    const razorpayOrder = await createRazorpayOrder(grandTotal, receipt);

    return successResponse({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
      computedTotal: grandTotal,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
