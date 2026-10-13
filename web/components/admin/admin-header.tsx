"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Right: Actions, Storefront Link, Admin Profile, Sign Out */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* View Storefront button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 text-xs font-bold gap-1.5 border-zinc-200 dark:border-zinc-700 hover:border-brand-500"
        >
          <Link href="/" target="_blank">
            <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">View Store</span>
          </Link>
        </Button>

        {/* Admin profile chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20">
            {session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>

          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-zinc-900 dark:text-white leading-none">
              {session?.user?.name || "Demo Admin"}
            </div>
            <div className="text-[10px] text-zinc-500 font-medium leading-none mt-1">
              {session?.user?.email || "admin@shoesy.demo"}
            </div>
          </div>

          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full">
            <ShieldAlert className="w-3 h-3" />
            ADMIN
          </span>
        </div>

        {/* Sign out button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 sm:px-3"
          title="Sign Out of Admin"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
