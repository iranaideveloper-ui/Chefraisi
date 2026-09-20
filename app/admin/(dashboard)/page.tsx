"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { HiOutlineClipboardDocumentList, HiOutlineUsers, HiOutlineBuildingOffice2, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import AreaSalesChart from "@/components/admin/AreaSalesChart";

type Stats = { users: number; consultations: number; pendingConsultations: number; registrations: number; launches: number; courses: number; successfulPayments: number; totalRevenue?: number };
type Consultation = { _id: string; name: string; family: string; consultationType: string; status: "pending" | "reviewed" | "referred"; createdAt: string };
type DashboardData = { stats: Stats; consultationSeries: { label: string; sales: number }[]; recentConsultations: Consultation[] };

const formatNumber = (value: number) => value.toLocaleString("fa-IR");

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { credentials: "include", cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "دریافت اطلاعات داشبورد ممکن نیست");
      setData(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "خطا در دریافت اطلاعات داشبورد");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = data?.stats;
  const cards = stats ? [
    { title: "کاربران ثبت‌نام‌شده", value: stats.users, href: "/admin/users", icon: HiOutlineUsers, tone: "text-sky-700" },
    { title: "ثبت‌نام دوره‌ها", value: stats.registrations, href: "/admin/courses", icon: HiOutlineClipboardDocumentList, tone: "text-green-700", detail: `${formatNumber(stats.courses)} دوره فعال` },
    { title: "درخواست‌های مشاوره", value: stats.consultations, href: "/admin/consultations", icon: HiOutlineUsers, tone: "text-amber-700", detail: `${formatNumber(stats.pendingConsultations)} در انتظار بررسی` },
    { title: "راه‌اندازی‌های ثبت‌شده", value: stats.launches, href: "/admin/projects", icon: HiOutlineBuildingOffice2, tone: "text-indigo-700" },
  ] : [];

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-800">داشبورد خدمات</h1><p className="mt-1 text-sm text-gray-500">نمای کلی عملکرد آموزش، راه‌اندازی و مشاوره</p></div><button onClick={loadDashboard} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"><RefreshCw className="h-4 w-4" />تازه‌سازی</button></div>
    {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {!data ? <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">در حال دریافت اطلاعات واقعی داشبورد...</div> : <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <Link key={card.title} href={card.href} className="group flex h-full"><StatCard title={card.title} value={formatNumber(card.value)} detail={card.detail} icon={<card.icon className={`h-8 w-8 ${card.tone}`} />} /></Link>)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-lg text-gray-700">روند درخواست‌های مشاوره</h2><p className="text-xs text-gray-500">هفت روز اخیر</p></div><HiOutlineChatBubbleLeftRight className="h-8 w-8 text-amber-600" /></div><AreaSalesChart data={data.consultationSeries} /></section>
        <section className="rounded-2xl bg-white p-6 shadow"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-lg text-gray-700">وضعیت عملیاتی</h2><p className="text-xs text-gray-500">شاخص‌های قابل پیگیری امروز</p></div><HiOutlineChatBubbleLeftRight className="h-8 w-8 text-[#d4af37]" /></div><div className="space-y-4 text-sm"><Metric label="کاربران ثبت‌نام‌شده" value={data.stats.users} /><Metric label="ثبت‌نام دوره‌ها" value={data.stats.registrations} /><Metric label="مشاوره‌های در انتظار" value={data.stats.pendingConsultations} /></div></section>
      </div>
      <section className="rounded-2xl bg-white p-6 shadow"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-lg text-gray-700">آخرین درخواست‌های مشاوره</h2><p className="text-xs text-gray-500">برای پیگیری به بخش درخواست‌های مشاوره بروید</p></div></div>{data.recentConsultations.length === 0 ? <p className="py-8 text-center text-gray-500">درخواستی ثبت نشده است.</p> : <div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b bg-gray-50"><th className="p-3">متقاضی</th><th className="p-3">نوع درخواست</th><th className="p-3">وضعیت</th><th className="p-3">تاریخ</th></tr></thead><tbody>{data.recentConsultations.map((item) => <tr key={item._id} className="border-b last:border-0"><td className="p-3">{item.name} {item.family}</td><td className="p-3">{item.consultationType}</td><td className="p-3"><span className={item.status === "pending" ? "text-amber-700" : item.status === "referred" ? "text-blue-700" : "text-green-700"}>{item.status === "pending" ? "در انتظار بررسی" : item.status === "referred" ? "ارجاع‌شده به مدیریت پروژه‌ها" : "بررسی شده"}</span></td><td className="p-3">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</td></tr>)}</tbody></table></div>}</section>
    </>}
  </div>;
}

function StatCard({ title, value, detail, icon }: { title: string; value: string; detail?: string; icon: React.ReactNode }) { return <div className="flex h-full min-h-[190px] flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-md"><div className="flex flex-1 items-start justify-between gap-4"><div><div className="text-3xl font-bold tracking-tight text-gray-800">{value}</div><div className="mt-2 text-sm font-medium text-gray-500">{title}</div>{detail && <div className="mt-2 text-xs text-amber-700">{detail}</div>}</div><div className="rounded-xl bg-gray-50 p-3">{icon}</div></div><div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-gray-400 transition group-hover:text-gray-700"><span>مشاهده جزئیات</span><ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /></div></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"><span className="text-gray-600">{label}</span><strong className="text-gray-800">{formatNumber(value)}</strong></div>; }
