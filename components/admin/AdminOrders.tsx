"use client";

import React, { useEffect, useState } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type Customer = {
  id: string;
  name: string;
  wallet?: number;
};

type Order = {
  id: string;
  customer: Customer;
  status: "active" | "closed" | "cancelled";
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrders() {
  const confirm = useConfirmDialog();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "closed">("active");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
    }
  }

  function visibleOrders() {
    if (!orders) return [];
    if (tab === "active") return orders.filter((o) => o.status === "active");
    return orders.filter((o) => o.status === "closed" || o.status === "cancelled");
  }

  async function performAction(orderId: string, action: string, opts?: Record<string, unknown>) {
    const confirmText =
      action === "cancel"
        ? "آیا از لغو سفارش اطمینان دارید؟"
        : action === "refund"
        ? "آیا می‌خواهید مبلغ را برگردانید؟"
        : action === "transfer"
        ? "آیا می‌خواهید مبلغ را به کیف پول مشتری منتقل کنید؟"
        : `اجرای ${action}`;

    if (!await confirm({ title: "تأیید عملیات سفارش", description: confirmText, confirmLabel: "تأیید" })) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ...opts }),
      });
      if (!res.ok) throw new Error("action failed");
      const data = await res.json();
      setMessage(data.message || "عملیات موفق");
      // refresh orders
      await fetchOrders();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "خطا در عملیات");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${tab === "active" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          onClick={() => setTab("active")}
        >
          سفارشات جاری
        </button>
        <button
          className={`px-3 py-1 rounded ${tab === "closed" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          onClick={() => setTab("closed")}
        >
          سفارشات بسته‌شده
        </button>
        <button className="ml-auto px-3 py-1 bg-gray-200 rounded" onClick={() => fetchOrders()}>
          تازه‌سازی
        </button>
      </div>

      {loading && <div>در حال بارگذاری...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {message && <div className="text-green-600">{message}</div>}

      <div>
        {visibleOrders().length === 0 && <div>سفارشی موجود نیست.</div>}

        <ul className="space-y-3">
          {visibleOrders().map((o) => (
            <li key={o.id} className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">سفارش #{o.id}</div>
                  <div>مشتری: {o.customer?.name || "—"}</div>
                  <div>وضعیت: {o.status}</div>
                  <div>مبلغ: {o.total} تومان</div>
                  <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href={`/admin/orders/${o.id}/edit`} className="px-3 py-1 bg-yellow-200 rounded">
                    ویرایش
                  </a>
                  <button
                    className="px-3 py-1 bg-red-200 rounded"
                    onClick={() => performAction(o.id, "cancel")}
                  >
                    لغو
                  </button>
                  <button
                    className="px-3 py-1 bg-indigo-200 rounded"
                    onClick={() => performAction(o.id, "transfer", { toWallet: true })}
                  >
                    انتقال به کیف‌پول
                  </button>
                  <button
                    className="px-3 py-1 bg-green-200 rounded"
                    onClick={() => performAction(o.id, "refund", { toWallet: false })}
                  >
                    عودت به مشتری
                  </button>
                </div>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-700">مشخصات آیتم‌ها ({o.items.length})</summary>
                <ul className="mt-2 space-y-1">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="text-sm">
                      {it.name} — {it.qty} × {it.price}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
