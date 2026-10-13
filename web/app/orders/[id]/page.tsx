import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  MapPin,
  CreditCard,
  Banknote,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { AnimatedSuccessCheck } from "@/components/storefront/animated-success-check";

interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams: {
    success?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${params.id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Authorization: user must own order or be ADMIN
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/");
  }

  const isSuccess = searchParams.success === "true";

  // Address parsing
  const address = order.shippingAddress as {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  const steps = [
    { label: "Order Placed", status: OrderStatus.PENDING },
    { label: "Processing", status: OrderStatus.PROCESSING },
    { label: "Shipped", status: OrderStatus.SHIPPED },
    { label: "Delivered", status: OrderStatus.DELIVERED },
  ];

  const currentStepIndex =
    order.status === OrderStatus.CANCELLED
      ? -1
      : steps.findIndex((s) => s.status === order.status);

  return (
    <div className="py-8 sm:py-14">
      <Container className="max-w-4xl space-y-8">
        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <AnimatedSuccessCheck />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Order Confirmed!
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-medium">
                  Thank you! Your sneakers have been reserved and will be dispatched shortly.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-black bg-black/20 px-4 py-2 rounded-full whitespace-nowrap">
              {order.orderNumber}
            </span>
          </div>
        )}

        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-brand-500 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-black italic uppercase text-zinc-900 dark:text-white">
                Order {order.orderNumber}
              </h1>
              {order.status === OrderStatus.CANCELLED ? (
                <Badge variant="destructive">Cancelled</Badge>
              ) : (
                <Badge variant="brand">{order.status}</Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/shop" className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Status Stepper (if not cancelled) */}
        {order.status !== OrderStatus.CANCELLED && (
          <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-6">
              Fulfillment Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.label} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isCompleted
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      } ${isCurrent ? "ring-4 ring-brand-500/20" : ""}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Column: Order Items & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Items */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Package className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold uppercase">Items In This Order</h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="relative w-18 h-18 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                      <Image
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80"
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Size: <span className="font-semibold text-zinc-700 dark:text-zinc-300">UK {item.size}</span> • Quantity: {item.quantity}
                      </p>
                      <p className="text-xs font-black text-brand-600 mt-1">
                        {formatPrice(Number(item.price))} each
                      </p>
                    </div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Grand Total</span>
                  <span className="text-xl text-brand-600">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="md:col-span-5 space-y-6">
            {/* Delivery address */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <MapPin className="w-4 h-4 text-brand-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Shipping Destination
                </h3>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-white">
                  {address.fullName || order.customerName}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} - {address.postalCode}
                </p>
                <p>{address.country || "India"}</p>
                <p className="text-zinc-400 pt-1">
                  Contact: {address.phone || order.customerPhone}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                {order.paymentMethod === "COD" ? (
                  <Banknote className="w-4 h-4 text-emerald-600" />
                ) : (
                  <CreditCard className="w-4 h-4 text-brand-500" />
                )}
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Payment Details
                </h3>
              </div>

              <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Method:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : "Razorpay (Online Payment)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Status:</span>
                  <span className="font-bold uppercase text-brand-600">
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between items-center font-mono text-[11px]">
                    <span className="text-zinc-400">Payment ID:</span>
                    <span>{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
