import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Your orders", "View your SHOESY order history and delivery status.", undefined, true);
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowRight } from "lucide-react";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Badge variant="warning">Order Placed</Badge>;
      case OrderStatus.PROCESSING:
        return <Badge variant="brand">Processing</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge variant="default">Shipped</Badge>;
      case OrderStatus.DELIVERED:
        return <Badge variant="success">Delivered</Badge>;
      case OrderStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="py-8 sm:py-14">
      <Container>
        <div className="pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">
            Purchase History
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
            My Orders ({orders.length})
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 sm:py-28 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              No Orders Found
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 mb-8 leading-relaxed">
              You haven&apos;t placed any orders yet. Discover our newest sneaker drops and place your first order.
            </p>
            <Button size="lg" asChild className="h-13 px-8 font-bold">
              <Link href="/shop" className="flex items-center gap-2">
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-zinc-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 block font-medium">Total</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">
                        {formatPrice(Number(order.totalAmount))}
                      </span>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                        <Image
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          UK {item.size} • Qty {item.quantity}
                        </p>
                        <p className="text-xs font-black text-brand-600 mt-0.5">
                          {formatPrice(Number(item.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
