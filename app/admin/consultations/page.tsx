"use client";

import { useEffect, useState } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRole } from "@/components/admin/useAdminRole";

type Consultation = { _id: string; name: string; family: string; phone: string; email: string; userMobile: string; consultationType: string; description: string; status: "pending" | "reviewed" | "referred"; createdAt: string };
type ConsultationService = { title: string; description: string };

const defaultServices: ConsultationService[] = [
  { title: "مشاوره تخصصی", description: "بررسی بازار، تحلیل رقبا و برنامه‌ریزی دقیق برای رشد کسب‌وکار." },
  { title: "طراحی و معماری", description: "طراحی داخلی حرفه‌ای، چیدمان و تجربه مشتری‌محور برای فضا." },
  { title: "آموزش و راه‌اندازی", description: "آموزش تیم، سرویس‌دهی، سیستم‌های عملیاتی و اجرا در سطح حرفه‌ای." },
  { title: "برندسازی و بازاریابی", description: "ساخت هویت متمایز و طراحی مسیر جذب و حفظ مشتریان هدف." },
  { title: "مدیریت و توسعه", description: "بهینه‌سازی عملیات، کنترل هزینه‌ها و برنامه‌ریزی برای رشد پایدار." },
];

export default function AdminConsultations() {
  const isSuperAdmin = useAdminRole();
  const confirm = useConfirmDialog();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ConsultationService[]>(defaultServices);
  const [savingServices, setSavingServices] = useState(false);
  const [serviceMessage, setServiceMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/consultations", { credentials: "include", cache: "no-store" });
    const result = await response.json();
    if (response.ok) setItems(result.consultations || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    fetch("/api/admin/consultation-services", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setServices(result.services || []))
      .catch(() => setServiceMessage("بارگذاری خدمات مشاوره انجام نشد"));
  }, []);

  const displayText = (value: string | undefined, fallback: string) => value && !/^\?+$/.test(value.trim()) ? value : fallback;
  const updateStatus = async (id: string, status: Consultation["status"]) => {
    const response = await fetch("/api/admin/consultations", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id, status }) });
    if (response.ok) setItems((current) => current.map((item) => item._id === id ? { ...item, status } : item));
  };
  const deleteConsultation = async (id: string) => {
    if (!await confirm({ title: "حذف درخواست مشاوره", description: "این درخواست حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    const response = await fetch("/api/admin/consultations", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    if (response.ok) setItems((current) => current.filter((item) => item._id !== id));
  };
  const updateService = (index: number, field: keyof ConsultationService, value: string) => setServices((current) => current.map((service, serviceIndex) => serviceIndex === index ? { ...service, [field]: value } : service));
  const saveServices = async () => {
    setSavingServices(true); setServiceMessage("");
    const response = await fetch("/api/admin/consultation-services", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ services }) });
    const result = await response.json();
    setSavingServices(false);
    if (!response.ok) { setServiceMessage(result.error || "ذخیره خدمات مشاوره انجام نشد"); return; }
    setServices(result.services); setServiceMessage("خدمات مشاوره با موفقیت ذخیره شد");
  };

  return <div className="flex flex-col gap-6">
    <section className="order-1 rounded-xl bg-white p-5 shadow">
      <div className="mb-5 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-800">درخواست‌های مشاوره</h1><p className="mt-1 text-sm text-gray-500">پیگیری درخواست‌ها و نتیجه تماس با مشتری</p></div><button onClick={load} className="rounded-lg bg-gray-100 px-4 py-2 text-sm">تازه‌سازی</button></div>
      {loading ? <p>در حال بارگذاری...</p> : items.length === 0 ? <div className="rounded-xl p-10 text-center text-gray-500">درخواستی ثبت نشده است.</div> : <div className="space-y-4">{items.map((item) => <article key={item._id} className="rounded-xl border border-gray-100 p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-gray-800">{displayText(item.name, "نام ثبت‌نشده")} {displayText(item.family, "نام خانوادگی ثبت‌نشده")}</h2><p className="text-sm text-gray-500" dir="ltr">{item.phone} | {item.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "pending" ? "bg-amber-100 text-amber-800" : item.status === "referred" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>{item.status === "pending" ? "در انتظار بررسی" : item.status === "referred" ? "ارجاع‌شده به مدیریت پروژه‌ها" : "بررسی شده"}</span></div><div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2"><p>نوع مشاوره: <strong>{displayText(item.consultationType, "نوع مشاوره ثبت‌نشده")}</strong></p><p>شماره حساب: <strong dir="ltr">{displayText(item.userMobile, "شماره ثبت‌نشده")}</strong></p><p>تاریخ: <strong>{new Date(item.createdAt).toLocaleDateString("fa-IR")}</strong></p></div><p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{displayText(item.description, "توضیحی ثبت نشده است.")}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => updateStatus(item._id, "reviewed")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white">تماس گرفته شد و بررسی شد</button><button onClick={() => updateStatus(item._id, "referred")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">ارجاع به مدیریت پروژه‌ها</button>{isSuperAdmin && <button onClick={() => deleteConsultation(item._id)} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700">حذف درخواست</button>}</div></article>)}</div>}
    </section>

    <section className="order-2 rounded-xl bg-white p-5 shadow">
      <div className="mb-5"><h2 className="text-xl font-bold text-gray-800">خدمات مشاوره‌ای ما</h2><p className="mt-1 text-sm text-gray-500">پنج عنوان ثابت زیر در بخش درخواست مشاوره سایت نمایش داده می‌شوند.</p></div>
      <div className="space-y-4">{services.map((service, index) => <div key={index} className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2"><label className="text-sm font-semibold text-gray-700">عنوان خدمت<input value={service.title} onChange={(event) => updateService(index, "title", event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal" /></label><label className="text-sm font-semibold text-gray-700">توضیح خدمت<textarea value={service.description} onChange={(event) => updateService(index, "description", event.target.value)} rows={2} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal" /></label></div>)}</div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={saveServices} disabled={savingServices || services.length !== 5} className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{savingServices ? "در حال ذخیره..." : "ذخیره خدمات مشاوره"}</button>{serviceMessage && <span className="text-sm text-blue-700">{serviceMessage}</span>}</div>
    </section>
  </div>;
}
