import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createRazorpayOrderSchema } from "@/lib/validations";
import { priceCart } from "@/lib/orders";
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

    const cart = await priceCart(validated.items);

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    const razorpayOrder = await createRazorpayOrder(cart.total, receipt);

    return successResponse({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
      computedTotal: cart.total,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
