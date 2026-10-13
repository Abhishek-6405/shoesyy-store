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

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersForRevenue,
      lowStockProducts,
      recentOrders,
      categoriesCount,
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
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.category.count(),
    ]);

    const totalRevenue = ordersForRevenue.reduce(
      (acc, o) => acc + Number(o.totalAmount),
      0
    );

    return successResponse({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        categoriesCount,
        lowStockCount: lowStockProducts.length,
      },
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
