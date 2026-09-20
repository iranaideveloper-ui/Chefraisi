"use client";

import { useEffect, useState } from "react";

type Order = { orderId: string; userMobile: string; createdAt: string; items: { id: number; name: string; price: number; count: number }[] };

export default function Courses() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ orderId: string; courseId: number } | null>(null);
  useEffect(() => {
    fetch("/api/orders", { credentials: "include", cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      setOrders(result.orders || []);
    });
  }, []);

  async function removeCourse(orderId: string, courseId: number) {
    const key = `${orderId}-${courseId}`;
    setDeleting(key);
    try {
      const response = await fetch("/api/orders", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ orderId, courseId }) });
      const result = await response.json();
      if (!response.ok) { window.alert(result.error || "حذف دوره انجام نشد"); return; }
      setOrders((current) => current.map((order) => order.orderId === orderId ? { ...order, items: order.items.filter((item) => item.id !== courseId) } : order).filter((order) => order.items.length > 0));
    } catch {
      window.alert("ارتباط با سرور برای حذف دوره برقرار نشد");
    } finally {
      setDeleting(null);
    }
  }

  return <div className="bg-black/50 rounded-lg p-6 text-white">
    <h1 className="text-2xl font-bold text-[#d4af37] mb-6">دوره های ثبت‌نام شده</h1>
    {orders.length === 0 ? <div className="rounded-lg border border-white/10 p-8 text-center text-gray-400">پس از خرید، دوره‌های شما در اینجا نمایش داده می‌شوند.</div> : <div className="space-y-4">{orders.flatMap((order) => order.items.map((item) => { const key = `${order.orderId}-${item.id}`; return <article key={key} className="bg-gray-800 rounded-lg p-4 border border-[#d4af37]/30"><div className="flex justify-between items-start mb-3"><span className="text-sm text-gray-400">خرید: {new Date(order.createdAt).toLocaleDateString("fa-IR")}</span><span className="bg-green-600 text-xs px-3 py-1 rounded-full">ثبت‌نام شده</span></div><h3 className="text-lg font-semibold text-[#d4af37] mb-2">{item.name}</h3><div className="flex items-center justify-between gap-3"><div><span className="text-gray-400 text-sm">تعداد: {item.count}</span><span className="mr-4 text-[#d4af37] font-semibold">{(item.price * item.count).toLocaleString("fa-IR")} تومان</span></div><button type="button" onClick={() => setPendingDelete({ orderId: order.orderId, courseId: item.id })} disabled={deleting === key} className="rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50">{deleting === key ? "در حال حذف..." : "حذف دوره"}</button></div></article>; }))}</div>}
    {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}><div role="dialog" aria-modal="true" aria-labelledby="delete-course-title" className="w-full max-w-md rounded-2xl border border-[#d4af37]/50 bg-gray-900 p-6 text-right shadow-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-xl font-bold text-red-300">!</div><h2 id="delete-course-title" className="text-lg font-bold text-white">حذف دوره ثبت‌نام‌شده</h2><p className="mt-2 text-sm leading-6 text-gray-300">این دوره از فهرست دوره‌های ثبت‌نام‌شده حذف می‌شود. آیا از ادامه مطمئن هستید؟</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-800">انصراف</button><button type="button" onClick={() => { const target = pendingDelete; setPendingDelete(null); void removeCourse(target.orderId, target.courseId); }} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">حذف دوره</button></div></div></div>}
  </div>;
}
