import React from "react";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin dashboard", "SHOESY sales, orders and inventory overview.", undefined, true);
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DashboardChartsLazy as DashboardCharts } from "@/components/admin/dashboard-charts-lazy";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    ordersForRevenue,
    lowStockProducts,
    recentOrders,
    ordersByStatusRaw,
    last30DaysOrders,
    topSellingItemsRaw,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: {
        id: true,
        name: true,
        brand: true,
        stock: true,
        price: true,
        images: true,
        slug: true,
      },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          status: { not: "CANCELLED" },
        },
      },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 5,
    }),
  ]);

  const totalRevenue = ordersForRevenue.reduce(
    (acc, o) => acc + Number(o.totalAmount),
    0
  );

  // 30-day timeline calculation
  const timelineMap = new Map<string, { date: string; label: string; revenue: number; orders: number }>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split("T")[0];
    const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    timelineMap.set(dateKey, { date: dateKey, label, revenue: 0, orders: 0 });
  }

  for (const order of last30DaysOrders) {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const bucket = timelineMap.get(dateKey);
    if (bucket) {
      bucket.orders += 1;
      if (order.status !== "CANCELLED") {
        bucket.revenue += Number(order.totalAmount);
      }
    }
  }

  const timeline = Array.from(timelineMap.values());

  const statusMeta: Record<string, { label: string; color: string }> = {
    DELIVERED: { label: "Delivered", color: "#10b981" },
    SHIPPED: { label: "Shipped", color: "#0ea5e9" },
    PROCESSING: { label: "Processing", color: "#f59e0b" },
    PENDING: { label: "Pending", color: "#6366f1" },
    CANCELLED: { label: "Cancelled", color: "#f43f5e" },
  };

  const ordersByStatus = ordersByStatusRaw.map((s) => ({
    status: s.status,
    count: s._count._all,
    label: statusMeta[s.status]?.label || s.status,
    color: statusMeta[s.status]?.color || "#71717a",
  }));

  const topProductIds = topSellingItemsRaw.map((i) => i.productId);
  const topProducts = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      images: true,
    },
  });

  const topProductMap = new Map(topProducts.map((p) => [p.id, p]));
  const topSellingProducts = topSellingItemsRaw.map((item) => {
    const details = topProductMap.get(item.productId);
    const unitsSold = item._sum.quantity || 0;
    const price = details ? Number(details.price) : 0;
    return {
      productId: item.productId,
      name: details?.name || "Product",
      brand: details?.brand || "Brand",
      image: details?.images[0] || "",
      unitsSold,
      revenue: unitsSold * price,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time analytics, sales performance, and operational alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="brand" size="sm">
            <Link href="/admin/products/new">
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards with Animated Count-up and Subtle Stagger */}
      <AdminStatCards
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalCustomers={totalCustomers}
        totalProducts={totalProducts}
        lowStockCount={lowStockProducts.length}
      />

      {/* Visual Charts: Recharts Component */}
      <DashboardCharts
        timeline={timeline}
        ordersByStatus={ordersByStatus}
        topSellingProducts={topSellingProducts}
      />

      {/* Two Column Grid: Recent Orders & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Recent Orders
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Latest customer purchases awaiting fulfillment
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-brand-700 dark:text-brand-400">
              <Link href="/admin/orders">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentOrders.map((order) => {
                  const statusVariant =
                    order.status === "DELIVERED"
                      ? "success"
                      : order.status === "CANCELLED"
                      ? "destructive"
                      : order.status === "SHIPPED"
                      ? "default"
                      : "warning";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-zinc-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusVariant} className="text-[10px] px-2 py-0.5">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-xs text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(Number(order.totalAmount))}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-bold text-brand-700 dark:text-brand-400 px-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            Details
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock Alerts List (1 col) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Low-Stock Alerts
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              &le; 5 units
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Sneakers reaching critically low inventory thresholds. Restock soon.
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-600 dark:text-zinc-400">
                No low stock alerts. All inventory levels are above 5 pairs.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-brand-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700 relative overflow-hidden shrink-0">
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400">{p.brand}</div>
                      <div className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5">
                        Only {p.stock} pair{p.stock === 1 ? "" : "s"} left
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild className="h-7 text-xs font-bold ml-2 shrink-0">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="ghost" size="sm" asChild className="w-full text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Link href="/admin/products?status=active&sort=stock-asc">
                View All Products by Stock <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
