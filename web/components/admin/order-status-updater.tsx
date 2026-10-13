"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderNumber: string;
}

export function OrderStatusUpdater({
  orderId,
  currentStatus: initialStatus,
  orderNumber,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(initialStatus);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return;

    if (newStatus === OrderStatus.CANCELLED) {
      setSelectedStatus(newStatus);
      setShowCancelDialog(true);
      return;
    }

    applyStatusUpdate(newStatus);
  };

  const applyStatusUpdate = async (statusToApply: OrderStatus) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToApply }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to update order status");
      }

      setCurrentStatus(statusToApply);
      setSelectedStatus(statusToApply);
      setShowCancelDialog(false);

      if (statusToApply === OrderStatus.CANCELLED) {
        success(`Order ${orderNumber} cancelled. Inventory stock has been restored!`);
      } else {
        success(`Order ${orderNumber} status changed to ${statusToApply}`);
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating order status";
      toastError(msg);
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusVariant =
    currentStatus === "DELIVERED"
      ? "success"
      : currentStatus === "CANCELLED"
      ? "destructive"
      : currentStatus === "SHIPPED"
      ? "default"
      : "warning";

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wider">
          Fulfillment Status
        </h3>
        <Badge variant={statusVariant} className="text-xs px-2.5 py-0.5">
          {currentStatus}
        </Badge>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Update Lifecycle Stage
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={isUpdating}
          className="w-full h-11 px-3 text-sm font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500 disabled:opacity-50"
        >
          <option value="PENDING">PENDING (Order Received)</option>
          <option value="PROCESSING">PROCESSING (Packing / Warehouse)</option>
          <option value="SHIPPED">SHIPPED (In Transit)</option>
          <option value="DELIVERED">DELIVERED (Customer Received)</option>
          <option value="CANCELLED">CANCELLED (Stock Restored)</option>
        </select>
      </div>

      <p className="text-[11px] text-zinc-400">
        Status transitions notify customer tracking views immediately.
      </p>

      {/* Confirmation Dialog for CANCELLED */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Cancel Order {orderNumber}?
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Cancelling this order will mark it as <span className="font-bold text-rose-500">CANCELLED</span>.
                All item quantities will be <span className="font-bold text-emerald-600 dark:text-emerald-400">automatically restored back into inventory</span> so other shoppers can purchase them.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCancelDialog(false);
                  setSelectedStatus(currentStatus);
                }}
                disabled={isUpdating}
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => applyStatusUpdate(OrderStatus.CANCELLED)}
                disabled={isUpdating}
              >
                {isUpdating ? "Restoring Stock & Cancelling..." : "Confirm Cancellation & Restore Stock"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
