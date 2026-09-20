"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ConfirmOptions = { title?: string; description?: string; confirmLabel?: string };

type DialogState = ConfirmOptions & { resolve: (confirmed: boolean) => void };
const ConfirmDialogContext = createContext<((options?: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const confirm = useCallback((options: ConfirmOptions = {}) => new Promise<boolean>((resolve) => setDialog({ resolve, ...options })), []);
  const close = (confirmed: boolean) => {
    dialog?.resolve(confirmed);
    setDialog(null);
  };
  return <ConfirmDialogContext.Provider value={confirm}>
    {children}
    {dialog && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-right shadow-2xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600"><span className="text-xl font-bold">!</span></div>
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900">{dialog.title || "تأیید عملیات"}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{dialog.description || "این عملیات قابل بازگشت نیست. آیا از ادامه مطمئن هستید؟"}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => close(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">انصراف</button>
          <button type="button" onClick={() => close(true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">{dialog.confirmLabel || "حذف"}</button>
        </div>
      </div>
    </div>
    )}
  </ConfirmDialogContext.Provider>;
}

export function useConfirmDialog() {
  const confirm = useContext(ConfirmDialogContext);
  if (!confirm) throw new Error("useConfirmDialog must be used inside ConfirmDialogProvider");
  return confirm;
}
