import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { computeShipping } from "@/lib/pricing";
import type { CreateOrderInput } from "@/lib/validations";

type OrderItemInput = CreateOrderInput["items"][number];

export interface PricedCart {
  lines: Array<{
    productId: string;
    name: string;
    price: number;
    size: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Prices a cart purely from DB data (client prices are never accepted) and
 * validates availability, sizes and stock. Does not modify anything.
 */
export async function priceCart(
  items: OrderItemInput[],
  db: Prisma.TransactionClient = prisma
): Promise<PricedCart> {
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, sizes: true, stock: true, images: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const requestedQty = new Map<string, number>();
  const lines: PricedCart["lines"] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ApiError(`Product "${item.productId}" is unavailable.`, 404);
    }
    if (!product.sizes.includes(item.size)) {
      throw new ApiError(
        `Size ${item.size} is unavailable for "${product.name}". Available sizes: ${product.sizes.join(", ")}`,
        400
      );
    }

    const totalQty = (requestedQty.get(product.id) ?? 0) + item.quantity;
    requestedQty.set(product.id, totalQty);
    if (product.stock < totalQty) {
      throw new ApiError(
        `Insufficient stock for "${product.name}". Requested ${totalQty}, but only ${product.stock} available.`,
        409
      );
    }

    const unitPrice = Number(product.price);
    subtotal += unitPrice * item.quantity;
    lines.push({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      size: item.size,
      quantity: item.quantity,
      image: product.images[0] || "",
    });
  }

  const shipping = computeShipping(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

interface PlaceOrderParams {
  userId: string;
  email: string;
  items: OrderItemInput[];
  shippingAddress: CreateOrderInput["shippingAddress"];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  orderNumberPrefix: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  /** If set, the server-computed total (in paise) must equal this amount. */
  expectedAmountPaise?: number;
}

export async function placeOrder(params: PlaceOrderParams) {
  return prisma.$transaction(async (tx) => {
    const cart = await priceCart(params.items, tx);

    if (
      params.expectedAmountPaise !== undefined &&
      Math.round(cart.total * 100) !== params.expectedAmountPaise
    ) {
      throw new ApiError("Paid amount does not match the order total. Order was not created.", 400);
    }

    // Conditional decrement: only succeeds if enough stock remains at write time,
    // which prevents overselling under concurrent checkouts.
    for (const line of cart.lines) {
      const { count } = await tx.product.updateMany({
        where: { id: line.productId, isActive: true, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (count !== 1) {
        throw new ApiError(`"${line.name}" just went out of stock. Please update your cart.`, 409);
      }
    }

    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    return tx.order.create({
      data: {
        orderNumber: `${params.orderNumberPrefix}-${timestamp}-${randomDigits}`,
        userId: params.userId,
        customerName: params.shippingAddress.fullName,
        customerEmail: params.email,
        customerPhone: params.shippingAddress.phone,
        shippingAddress: params.shippingAddress,
        totalAmount: cart.total,
        status: params.status,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentStatus,
        razorpayOrderId: params.razorpayOrderId ?? null,
        razorpayPaymentId: params.razorpayPaymentId ?? null,
        items: { create: cart.lines },
      },
      include: { items: true },
    });
  }, TX_OPTIONS);
}

// Each statement is a network round-trip to Neon, so allow more than Prisma's 5s default.
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

export function serializeOrder<
  T extends { totalAmount: Prisma.Decimal; items: Array<{ price: Prisma.Decimal }> }
>(order: T) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}
