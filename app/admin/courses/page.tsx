"use client";

import { useEffect, useState } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Order = { id: string; customer: { name: string }; createdAt: string; items: { id?: number; name: string; qty: number; price: number }[] };

export default function AdminCourses() {
  const confirm = useConfirmDialog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => { fetch("/api/admin/orders", { credentials: "include", cache: "no-store" }).then((response) => response.json()).then((data) => setOrders(data.orders || [])).finally(() => setLoading(false)); fetch("/api/auth/me", { credentials: "include", cache: "no-store" }).then((response) => response.json()).then((data) => setIsSuperAdmin(data.user?.role === "super_admin")); }, []);
  const courses = orders.flatMap((order) => order.items.map((item) => ({ ...item, orderId: order.id, customer: order.customer.name || "کاربر ثبت‌نام‌شده", createdAt: order.createdAt })));
  const removeEnrollment = async (orderId: string, courseId?: number) => {
    if (courseId === undefined) return;
    if (!await confirm({ title: "حذف ثبت‌نام دوره", description: "این دوره از ثبت‌نام‌های مشتری حذف می‌شود.", confirmLabel: "حذف ثبت‌نام" })) return;
    const key = `${orderId}-${courseId}`; setDeleting(key);
    const response = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ courseId }) });
    const result = await response.json();
    if (!response.ok) window.alert(result.error || "حذف ثبت‌نام انجام نشد");
    else setOrders((current) => current.map((order) => order.id === orderId ? { ...order, items: order.items.filter((item) => item.id !== courseId) } : order).filter((order) => order.items.length));
    setDeleting(null);
  };
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-800">ثبت‌نام در دوره‌ها</h1><p className="mt-1 text-sm text-gray-500">ثبت‌نام‌های انجام‌شده از سفارش‌های نهایی، شامل دوره‌های رایگان</p></div>{loading ? <p>در حال بارگذاری...</p> : courses.length === 0 ? <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">هنوز ثبت‌نامی برای دوره‌ها انجام نشده است.</div> : <div className="overflow-x-auto rounded-xl bg-white shadow"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-4">دوره</th><th className="p-4">مشتری</th><th className="p-4">تعداد</th><th className="p-4">شماره سفارش</th><th className="p-4">تاریخ</th>{isSuperAdmin && <th className="p-4">عملیات</th>}</tr></thead><tbody>{courses.map((course) => { const key = `${course.orderId}-${course.id}`; return <tr key={key} className="border-b last:border-0"><td className="p-4 font-medium">{course.name}</td><td className="p-4">{course.customer}</td><td className="p-4">{course.qty}</td><td className="p-4">{course.orderId}</td><td className="p-4">{new Date(course.createdAt).toLocaleDateString("fa-IR")}</td>{isSuperAdmin && <td className="p-4"><button type="button" onClick={() => removeEnrollment(course.orderId, course.id)} disabled={deleting === key} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50">{deleting === key ? "در حال حذف..." : "حذف"}</button></td>}</tr>; })}</tbody></table></div>}</div>;
}
