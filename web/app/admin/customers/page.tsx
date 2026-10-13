import React from "react";
import prisma from "@/lib/prisma";
import { CustomersTable, CustomerItem } from "@/components/admin/customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCustomers: CustomerItem[] = users.map((u) => {
    const orderCount = u.orders.length;
    const totalSpent = u.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      orderCount,
      totalSpent,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
          Customer Accounts
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review customer purchase frequency, lifetime value, and account roles.
        </p>
      </div>

      <CustomersTable initialCustomers={formattedCustomers} />
    </div>
  );
}
