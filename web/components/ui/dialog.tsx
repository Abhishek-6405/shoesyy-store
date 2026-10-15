"use client";

import type { ReactNode } from "react";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

export function Dialog({ children, label, onClose }: { children: ReactNode; label: string; onClose: () => void }) {
  const ref = useFocusTrap(true, onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className="max-h-[90vh] overflow-y-auto max-w-md w-full">
        {children}
      </div>
    </div>
  );
}
