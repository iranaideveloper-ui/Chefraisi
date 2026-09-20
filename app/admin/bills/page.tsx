"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type BillStatus = "paid" | "unpaid";

type Bill = {
  id: string;
  customer: string;
  reference?: string;
  amount: number;
  status: BillStatus;
  createdAt: string;
  paidAt?: string | null;
  note?: string;
};

const STORAGE_KEY = "fermo_bills";

function formatCurrency(n: number) {
  try {
    return n.toLocaleString() + " تومان";
  } catch {
    return n + " تومان";
  }
}

export default function BillsPage() {
  const confirm = useConfirmDialog();
  const [bills, setBills] = useState<Bill[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | BillStatus>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const parsed = JSON.parse(raw);
      const norm: Bill[] = Array.isArray(parsed)
        ? parsed.map((p: Record<string, unknown>) => {
            const createdAt = typeof p["createdAt"] === "string" ? (p["createdAt"] as string) : new Date().toISOString();
            return {
              id: String(p["id"] ?? `B${Date.now()}`),
              customer: String(p["customer"] ?? ""),
              reference: p["reference"] ? String(p["reference"]) : undefined,
              amount: Number(p["amount"] ?? 0),
              status: p["status"] === "paid" ? "paid" : "unpaid",
              createdAt,
              paidAt: p["paidAt"] ?? null,
              note: p["note"] ?? undefined,
            } as Bill;
          })
        : [];
      setBills(norm);
    } catch (err) {
      console.error("failed to load bills", err);
      setBills([]);
    }
  }, []);

  const save = (next: Bill[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBills(next);
  };

  const addMockBill = () => {
    const next: Bill = {
      id: `B${Date.now()}`,
      customer: "مشتری نمونه",
      reference: `REF${Math.floor(Math.random() * 9000) + 1000}`,
      amount: Math.floor(Math.random() * 500000) + 50000,
      status: "unpaid",
      createdAt: new Date().toISOString(),
      paidAt: null,
      note: "فاکتور آزمایشی ایجاد شده از پنل مدیریت",
    };
  save([next, ...bills] as Bill[]);
  };

  const markPaid = (id: string) => {
  const next = bills.map((b) => (b.id === id ? { ...b, status: "paid", paidAt: new Date().toISOString() } : b));
  save(next as Bill[]);
  };

  const markUnpaid = (id: string) => {
  const next = bills.map((b) => (b.id === id ? { ...b, status: "unpaid", paidAt: null } : b));
  save(next as Bill[]);
  };

  const removeBill = async (id: string) => {
    if (!await confirm({ title: "حذف فاکتور", description: "این فاکتور حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
  const next = bills.filter((b) => b.id !== id);
  save(next as Bill[]);
  };

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!query) return true;
      const q = query.trim().toLowerCase();
      return (
        b.customer.toLowerCase().includes(q) ||
        (b.reference || "").toLowerCase().includes(q) ||
        String(b.amount).includes(q)
      );
    });
  }, [bills, query, filter]);

  const exportCSV = () => {
    const rows = [
      ["id", "customer", "reference", "amount", "status", "createdAt", "paidAt", "note"],
      ...bills.map((b) => [b.id, b.customer, b.reference || "", String(b.amount), b.status, b.createdAt, b.paidAt || "", b.note || ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fermo_bills_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">مدیریت فاکتورها</h2>
          <p className="text-sm text-gray-400">اینجا لیست فاکتورها را مشاهده و مدیریت کنید.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addMockBill} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">افزودن فاکتور نمونه</button>
          <button onClick={exportCSV} className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">اکسپورت CSV</button>
        </div>
      </div>

      <div className="flex gap-3 items-center mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو با نام، مرجع یا مبلغ..." className="bg-white/5 px-3 py-2 rounded w-80" />
  <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | BillStatus)} className="bg-white/5 px-3 py-2 rounded">
          <option value="all">همه</option>
          <option value="paid">پرداخت‌شده</option>
          <option value="unpaid">پرداخت‌نشده</option>
        </select>
        <div className="text-sm text-gray-400">تعداد: {filtered.length}</div>
      </div>

      <div className="bg-black/60 rounded-lg overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-sm text-gray-300">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">مشتری</th>
              <th className="px-4 py-3">مرجع</th>
              <th className="px-4 py-3">مبلغ</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3">ایجاد شده</th>
              <th className="px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, idx) => (
              <tr key={b.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-sm text-gray-200">{idx + 1}</td>
                <td className="px-4 py-3 text-sm">{b.customer}</td>
                <td className="px-4 py-3 text-sm">{b.reference || "—"}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3 text-sm">
                  {b.status === "paid" ? <span className="text-green-400">پرداخت‌شده</span> : <span className="text-yellow-300">پرداخت‌نشده</span>}
                </td>
                <td className="px-4 py-3 text-sm">{new Date(b.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {b.status === "unpaid" ? (
                      <button onClick={() => markPaid(b.id)} className="px-2 py-1 bg-[#d4af37] rounded text-white text-sm hover:bg-[#b8962e]">علامت پرداخت</button>
                    ) : (
                      <button onClick={() => markUnpaid(b.id)} className="px-2 py-1 bg-yellow-500 rounded text-white text-sm hover:bg-yellow-600">علامت عدم پرداخت</button>
                    )}
                    <button onClick={() => removeBill(b.id)} className="px-2 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">هیچ فاکتوری مطابق فیلتر پیدا نشد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
