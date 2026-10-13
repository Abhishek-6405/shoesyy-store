import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Mail,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr =
    typeof order.shippingAddress === "object" && order.shippingAddress !== null
      ? (order.shippingAddress as Record<string, string>)
      : { street: String(order.shippingAddress || "") };

  const subtotal = order.items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );
  const totalAmount = Number(order.totalAmount);
  const shippingFee = totalAmount > subtotal ? totalAmount - subtotal : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold gap-1.5 mb-2 -ml-2"
          >
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </Button>

          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-3">
            <span>Order #{order.orderNumber}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Pricing Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" />
                Purchased Footwear ({order.items.length} item{order.items.length === 1 ? "" : "s"})
              </h3>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map((item) => {
                const itemPrice = Number(item.price);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Size: <span className="font-bold text-zinc-800 dark:text-zinc-200">UK {item.size}</span> &bull; Quantity:{" "}
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span>
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-1">
                        {formatPrice(itemPrice)} each
                      </div>
                    </div>

                    <div className="text-right font-mono font-black text-sm text-zinc-900 dark:text-white whitespace-nowrap">
                      {formatPrice(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="p-6 bg-zinc-50/60 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Standard Delivery:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <span>Total Amount:</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                <User className="w-4 h-4 text-brand-500" />
                Customer Contact
              </div>
              <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-300">
                <div className="font-bold text-zinc-900 dark:text-white">
                  {order.customerName}
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail className="w-3.5 h-3.5" /> {order.customerEmail}
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                  </div>
                )}
                {order.user && (
                  <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
                    Account: {order.user.role} member since{" "}
                    {new Date(order.user.createdAt).getFullYear()}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-brand-500" />
                Delivery Address
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 leading-relaxed">
                <div>{shippingAddr.street}</div>
                <div>
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  {shippingAddr.country || "India"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Status Updater & Payment Details (1 col) */}
        <div className="space-y-6">
          {/* Status Updater */}
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            orderNumber={order.orderNumber}
          />

          {/* Payment Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" />
              Payment Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Method:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Razorpay Online Payment"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Payment Status:</span>
                <span
                  className={`font-black uppercase text-[11px] px-2 py-0.5 rounded ${
                    order.paymentStatus === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED"
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Settled Amount:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
