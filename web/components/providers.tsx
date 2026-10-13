"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <ToastProvider>{children}</ToastProvider>
        </MotionConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
