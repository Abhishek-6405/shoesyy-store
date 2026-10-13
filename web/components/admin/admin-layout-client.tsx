"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { Sparkles } from "lucide-react";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Demo Mode Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-brand-500 to-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm z-50">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>
          Demo Admin Mode Active &bull; Demo accounts (admin@shoesy.demo, user@shoesy.demo) are protected against modification or deletion.
        </span>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
