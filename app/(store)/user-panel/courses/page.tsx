"use client";

import { useEffect, useState } from "react";
import CourseLessonsDialog, { type CourseVideoLesson } from "@/components/CourseLessonsDialog";

type Order = { orderId: string; userMobile: string; createdAt: string; items: { id: number; name: string; price: number; count: number }[] };
type PlayerCourse = { id: number; title: string; isFree: boolean; lessons: CourseVideoLesson[] };

export default function Courses() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ orderId: string; courseId: number } | null>(null);
  const [loadingCourse, setLoadingCourse] = useState<number | null>(null);
  const [activeCourse, setActiveCourse] = useState<PlayerCourse | null>(null);
  const [courseMessage, setCourseMessage] = useState("");
  useEffect(() => {
    fetch("/api/orders", { credentials: "include", cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      setOrders(result.orders || []);
    });
  }, []);

  async function openCourse(courseId: number) {
    setLoadingCourse(courseId);
    setCourseMessage("");
    try {
      const response = await fetch(`/api/user-panel/courses/${courseId}`, { credentials: "include", cache: "no-store" });
      const result = await response.json() as { course?: PlayerCourse; error?: string };
      if (!response.ok || !result.course) throw new Error(result.error || "دریافت قسمت‌های دوره انجام نشد");
      if (result.course.lessons.length === 0) {
        setCourseMessage("برای این دوره هنوز ویدیویی ثبت نشده است.");
        return;
      }
      setActiveCourse(result.course);
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "دریافت قسمت‌های دوره انجام نشد");
    } finally {
      setLoadingCourse(null);
    }
  }

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

  return (
    <div className="rounded-lg bg-black/50 p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold text-[#d4af37]">دوره‌های ثبت‌نام‌شده</h1>
      {courseMessage && <p role="status" className="mb-4 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 p-3 text-sm text-[#f5d77d]">{courseMessage}</p>}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-8 text-center text-gray-400">پس از خرید، دوره‌های شما در اینجا نمایش داده می‌شوند.</div>
      ) : (
        <div className="space-y-4">
          {orders.flatMap((order) => order.items.map((item) => {
            const key = `${order.orderId}-${item.id}`;
            return (
              <article key={key} className="rounded-lg border border-[#d4af37]/30 bg-gray-800 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="text-sm text-gray-400">خرید: {new Date(order.createdAt).toLocaleDateString("fa-IR")}</span>
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs">ثبت‌نام شده</span>
                </div>
                <h2 className="mb-3 break-words text-lg font-semibold text-[#d4af37]">{item.name}</h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-sm text-gray-400">تعداد: {item.count}</span>
                    <span className="mr-4 font-semibold text-[#d4af37]">{(item.price * item.count).toLocaleString("fa-IR")} تومان</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void openCourse(item.id)} disabled={loadingCourse === item.id} className="min-h-10 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-bold text-gray-950 transition hover:bg-[#e6c65e] disabled:cursor-wait disabled:opacity-60">
                      {loadingCourse === item.id ? "در حال بارگذاری..." : "پخش دوره"}
                    </button>
                    <button type="button" onClick={() => setPendingDelete({ orderId: order.orderId, courseId: item.id })} disabled={deleting === key} className="min-h-10 rounded-lg border border-red-400/50 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {deleting === key ? "در حال حذف..." : "حذف دوره"}
                    </button>
                  </div>
                </div>
              </article>
            );
          }))}
        </div>
      )}
      {activeCourse && <CourseLessonsDialog key={activeCourse.id} courseTitle={activeCourse.title} lessons={activeCourse.lessons} access="full" onClose={() => setActiveCourse(null)} />}
      {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}><div role="dialog" aria-modal="true" aria-labelledby="delete-course-title" className="w-full max-w-md rounded-2xl border border-[#d4af37]/50 bg-gray-900 p-6 text-right shadow-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-xl font-bold text-red-300">!</div><h2 id="delete-course-title" className="text-lg font-bold text-white">حذف دوره ثبت‌نام‌شده</h2><p className="mt-2 text-sm leading-6 text-gray-300">این دوره از فهرست دوره‌های ثبت‌نام‌شده حذف می‌شود. آیا از ادامه مطمئن هستید؟</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-800">انصراف</button><button type="button" onClick={() => { const target = pendingDelete; setPendingDelete(null); void removeCourse(target.orderId, target.courseId); }} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">حذف دوره</button></div></div></div>}
    </div>
  );
}
