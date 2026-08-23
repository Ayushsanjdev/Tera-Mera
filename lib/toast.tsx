"use client";

import { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string; variant: "success" | "error" };
const ToastContext = createContext<
  (message: string, variant?: Toast["variant"]) => void
>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: Toast["variant"] = "success") => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(
        () => setToasts((t) => t.filter((toast) => toast.id !== id)),
        2500,
      );
    },
    [],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-[fadeIn_0.15s_ease-out] rounded-md border px-4 py-2 text-sm shadow-lg ${
              t.variant === "error"
                ? "border-[var(--coral)]/30 bg-[var(--surface)] text-[var(--coral)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
