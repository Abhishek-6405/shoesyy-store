"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { TRANSITION_FAST } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin portal remains completely snappy without page transition delays
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={TRANSITION_FAST}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
