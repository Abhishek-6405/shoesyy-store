"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, d?: number) => addToast(msg, "success", d), [addToast]);
  const error = useCallback((msg: string, d?: number) => addToast(msg, "error", d), [addToast]);
  const info = useCallback((msg: string, d?: number) => addToast(msg, "info", d), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className={`pointer-events-auto relative overflow-hidden flex items-center justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-colors ${
                t.type === "success"
                  ? "bg-white/95 text-emerald-950 border-emerald-200 dark:bg-zinc-900/95 dark:text-emerald-100 dark:border-emerald-800/60"
                  : t.type === "error"
                  ? "bg-white/95 text-rose-950 border-rose-200 dark:bg-zinc-900/95 dark:text-rose-100 dark:border-rose-800/60"
                  : "bg-white/95 text-zinc-900 border-zinc-200 dark:bg-zinc-900/95 dark:text-zinc-100 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {t.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {t.type === "error" && (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                {t.type === "info" && (
                  <Info className="w-5 h-5 text-brand-500 shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-semibold leading-snug">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="ml-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Bar indicating time to auto-dismiss */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (t.duration || 4000) / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 rounded-full ${
                  t.type === "success"
                    ? "bg-emerald-500"
                    : t.type === "error"
                    ? "bg-rose-500"
                    : "bg-brand-500"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
