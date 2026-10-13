import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    // 30 days timeline calculation
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
      categoriesCount,
      ordersByStatusRaw,
      last30DaysOrders,
      topSellingItemsRaw,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.product.count(),
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
        },
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
        },
        orderBy: { stock: "asc" },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.category.count(),
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

    // Build continuous 30-day buckets for Recharts
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

    // Status colors and labels
    const statusMeta: Record<string, { label: string; color: string }> = {
      DELIVERED: { label: "Delivered", color: "#10b981" }, // emerald-500
      SHIPPED: { label: "Shipped", color: "#0ea5e9" }, // sky-500
      PROCESSING: { label: "Processing", color: "#f59e0b" }, // amber-500
      PENDING: { label: "Pending", color: "#6366f1" }, // indigo-500
      CANCELLED: { label: "Cancelled", color: "#f43f5e" }, // rose-500
    };

    const ordersByStatus = ordersByStatusRaw.map((s) => ({
      status: s.status,
      count: s._count._all,
      label: statusMeta[s.status]?.label || s.status,
      color: statusMeta[s.status]?.color || "#71717a",
    }));

    // Resolve top 5 selling products details
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
        name: details?.name || "Unknown Sneaker",
        brand: details?.brand || "Brand",
        image: details?.images[0] || "",
        unitsSold,
        revenue: unitsSold * price,
      };
    });

    return successResponse({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        categoriesCount,
        lowStockCount: lowStockProducts.length,
      },
      timeline,
      ordersByStatus,
      topSellingProducts,
      lowStockProducts: lowStockProducts.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
      recentOrders: recentOrders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        items: o.items.map((i) => ({
          ...i,
          price: Number(i.price),
        })),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
