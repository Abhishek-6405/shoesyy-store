"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Flame,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    exact: false,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    exact: false,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    exact: false,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    exact: false,
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-200 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/80">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-wider text-white"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span>
              SHOESY <span className="text-brand-500 text-xs font-sans font-black tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 ml-1">ADMIN</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="adminSidebarActive"
                    className="absolute inset-0 bg-brand-500 rounded-xl shadow-md shadow-brand-500/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-zinc-400"}`} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer Quick Links & Status */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              Live Storefront
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">↗</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">RBAC Protected (ADMIN)</span>
          </div>
        </div>
      </aside>
    </>
  );
}
