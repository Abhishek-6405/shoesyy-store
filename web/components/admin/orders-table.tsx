"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
  firstItem?: {
    name: string;
    image: string;
    size: number;
  };
}

interface OrdersTableProps {
  orders: OrderListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentFilters: {
    search: string;
    status: string;
    sort: string;
  };
}

export function OrdersTable({
  orders,
  pagination,
  currentFilters,
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentFilters.search);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search.trim());
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by order #, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentFilters.status || "all"}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending (Placed)</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={currentFilters.sort || "newest"}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total-desc">Amount: High to Low</option>
              <option value="total-asc">Amount: Low to High</option>
            </select>

            {(currentFilters.search || (currentFilters.status && currentFilters.status !== "all")) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/orders")}
                className="h-10 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-zinc-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusVariant =
                    order.status === "DELIVERED"
                      ? "success"
                      : order.status === "CANCELLED"
                      ? "destructive"
                      : order.status === "SHIPPED"
                      ? "default"
                      : "warning";

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Order Number & Timestamp */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-zinc-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {order.customerEmail}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {order.firstItem?.image && (
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                              <Image
                                src={order.firstItem.image}
                                alt="Item"
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                          )}
                          <div className="text-xs">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                              {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                            </span>
                            {order.firstItem && (
                              <div className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                                UK {order.firstItem.size} &bull; {order.firstItem.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
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
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={statusVariant} className="text-[10px] px-2.5 py-0.5">
                          {order.status}
                        </Badge>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-xs text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 text-xs font-bold"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Showing{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {pagination.total}
              </span>{" "}
              orders
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <span className="px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="h-8 px-2.5 text-xs"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
