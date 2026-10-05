"use client";

import { createContext, useContext, useRef, useState } from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };
type Notify = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<Notify | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const notify: Notify = (message, kind = "info") => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000);
  };

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return <ToastContext.Provider value={notify}>
    {children}
    <div aria-live="polite" aria-relevant="additions text" className="pointer-events-none fixed bottom-24 left-4 z-120 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 md:bottom-6 sm:left-6">
      {toasts.map((toast) => {
        const Icon = toast.kind === "success" ? Check : toast.kind === "error" ? TriangleAlert : Info;
        const tone = toast.kind === "success" ? "border-green-200 bg-green-50 text-green-900" : toast.kind === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-sky-200 bg-white text-gray-900";
        return <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg ${tone}`}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-6">{toast.message}</p>
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="بستن اعلان" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>;
      })}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used inside ToastProvider");
  return notify;
}
