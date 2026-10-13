import React from "react";
import prisma from "@/lib/prisma";
import { OrdersTable, OrderListItem } from "@/components/admin/orders-table";
import { OrderStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const search = searchParams.search?.trim();
  const statusParam = searchParams.status?.trim() as OrderStatus | undefined;
  const sort = searchParams.sort || "newest";

  const where: Prisma.OrderWhereInput = {};

  if (statusParam && Object.values(OrderStatus).includes(statusParam)) {
    where.status = statusParam;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "total-desc") orderBy = { totalAmount: "desc" };
  else if (sort === "total-asc") orderBy = { totalAmount: "asc" };

  const [total, ordersRaw] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: { name: true, image: true, size: true, quantity: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const orders: OrderListItem[] = ordersRaw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    totalAmount: Number(o.totalAmount),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    firstItem: o.items[0]
      ? {
          name: o.items[0].name,
          image: o.items[0].image,
          size: o.items[0].size,
        }
      : undefined,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
          Orders Fulfillment
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Track customer shipments, process dispatches, and update fulfillment milestones.
        </p>
      </div>

      <OrdersTable
        orders={orders}
        pagination={{
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }}
        currentFilters={{
          search: search || "",
          status: statusParam || "all",
          sort,
        }}
      />
    </div>
  );
}
