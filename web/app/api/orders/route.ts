import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
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

    const formatted = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
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
    const validated = createOrderSchema.parse(body);

    // Extract product IDs
    const productIds = validated.items.map((i) => i.productId);

    // Run order placement inside an interactive Prisma transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch live active product data from DB
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
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

      // 2. Validate stock, sizes, and calculate prices
      for (const item of validated.items) {
        const product = productMap.get(item.productId);

        if (!product || !product.isActive) {
          throw new Error(`Product with ID "${item.productId}" is unavailable or inactive.`);
        }

        if (!product.sizes.includes(item.size)) {
          throw new Error(
            `Size ${item.size} is unavailable for "${product.name}". Available sizes: ${product.sizes.join(", ")}`
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested ${item.quantity}, but only ${product.stock} available.`
          );
        }

        const unitPrice = Number(product.price);
        grandTotal += unitPrice * item.quantity;

        // Decrement product stock
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

      // 3. Generate clean human-readable order number
      const timestamp = Date.now().toString().slice(-6);
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${timestamp}-${randomDigits}`;

      // 4. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: validated.shippingAddress.fullName,
          customerEmail: user.email || "",
          customerPhone: validated.shippingAddress.phone,
          shippingAddress: validated.shippingAddress,
          totalAmount: grandTotal,
          status: OrderStatus.PENDING,
          paymentMethod: validated.paymentMethod,
          paymentStatus:
            validated.paymentMethod === PaymentMethod.COD
              ? PaymentStatus.PENDING
              : validated.razorpayPaymentId
              ? PaymentStatus.COMPLETED
              : PaymentStatus.PENDING,
          razorpayOrderId: validated.razorpayOrderId ?? null,
          razorpayPaymentId: validated.razorpayPaymentId ?? null,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return successResponse(
      {
        ...createdOrder,
        totalAmount: Number(createdOrder.totalAmount),
        items: createdOrder.items.map((i) => ({
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
