"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Lock,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Role } from "@prisma/client";

export interface CustomerItem {
  id: string;
  name: string | null;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomersTableProps {
  initialCustomers: CustomerItem[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<CustomerItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isDemoAccount = (email: string) => {
    return email === "admin@shoesy.demo" || email === "user@shoesy.demo";
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q);

    const matchesRole = roleFilter === "all" || c.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Toggle user role (between USER and ADMIN)
  const handleToggleRole = async (customer: CustomerItem) => {
    if (isDemoAccount(customer.email)) {
      toastError("Demo accounts cannot be demoted or promoted.");
      return;
    }

    const nextRole: Role = customer.role === Role.ADMIN ? Role.USER : Role.ADMIN;

    try {
      const res = await fetch(`/api/admin/users/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to update user role");
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, role: nextRole } : c))
      );

      success(`Updated ${customer.email} role to ${nextRole}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating role";
      toastError(msg);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to delete user");
      }

      setCustomers((prev) => prev.filter((c) => c.id !== userToDelete.id));
      success(`User ${userToDelete.email} removed.`);
      setUserToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting user";
      toastError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="USER">Customers (USER)</option>
            <option value="ADMIN">Administrators (ADMIN)</option>
          </select>

          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="h-10 text-xs text-zinc-500"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-zinc-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isDemo = isDemoAccount(cust.email);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0">
                            {cust.name?.[0]?.toUpperCase() || cust.email[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                {cust.name || "Customer"}
                              </span>
                              {isDemo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Sparkles className="w-2.5 h-2.5" /> Demo
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                              {cust.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">
                        @{cust.username}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {cust.role === Role.ADMIN ? (
                          <Badge variant="brand" className="text-[10px] px-2 py-0.5">
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            USER
                          </Badge>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                          {cust.orderCount} order{cust.orderCount === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(cust.totalSpent)}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-zinc-400 whitespace-nowrap">
                        {new Date(cust.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isDemo ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg"
                            title="Protected Demo Account"
                          >
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRole(cust)}
                              className="h-7 text-xs font-semibold px-2 text-zinc-600 dark:text-zinc-300 hover:text-brand-500"
                              title={`Switch role to ${cust.role === Role.ADMIN ? "USER" : "ADMIN"}`}
                            >
                              {cust.role === Role.ADMIN ? "Demote" : "Promote"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(cust)}
                              className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Delete Customer Account?
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Are you sure you want to delete user{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {userToDelete.email}
                </span>
                ? This action is permanent.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserToDelete(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteUser}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
