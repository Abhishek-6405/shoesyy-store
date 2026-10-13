import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { verifyRazorpayPaymentSchema } from "@/lib/validations";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAuth();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
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

    const { orderData } = validated;
    const productIds = orderData.items.map((i) => i.productId);

    // Commit order and stock decrement in an interactive transaction
    const finalOrder = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));
      let grandTotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        name: string;
        price: number;
        size: number;
        quantity: number;
        image: string;
      }> = [];

      for (const item of orderData.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} no longer found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const unitPrice = Number(product.price);
        grandTotal += unitPrice * item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        orderItemsToCreate.push({
          productId: product.id,
          name: product.name,
          price: unitPrice,
          size: item.size,
          quantity: item.quantity,
          image: product.images[0] || "",
        });
      }

      const timestamp = Date.now().toString().slice(-6);
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-RZP-${timestamp}-${randomDigits}`;

      return tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: orderData.shippingAddress.fullName,
          customerEmail: user.email || "",
          customerPhone: orderData.shippingAddress.phone,
          shippingAddress: orderData.shippingAddress,
          totalAmount: grandTotal,
          status: OrderStatus.PROCESSING,
          paymentMethod: PaymentMethod.RAZORPAY,
          paymentStatus: PaymentStatus.COMPLETED,
          razorpayOrderId: validated.razorpayOrderId,
          razorpayPaymentId: validated.razorpayPaymentId,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });
    });

    return successResponse(
      {
        ...finalOrder,
        totalAmount: Number(finalOrder.totalAmount),
        items: finalOrder.items.map((i) => ({
          ...i,
          price: Number(i.price),
        })),
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
