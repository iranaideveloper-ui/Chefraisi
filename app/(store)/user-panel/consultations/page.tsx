"use client";

import { useEffect, useState } from "react";

type Consultation = { id: string; consultationType: string; description: string; status?: string; createdAt: string; userMobile: string };

export default function Consultations() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch("/api/consultations", { signal: controller.signal, credentials: "include", cache: "no-store" });
        const result = await response.json();
        if (!response.ok) {
          setMessage(result.error || "برای مشاهده درخواست‌ها ابتدا وارد حساب کاربری شوید.");
          return;
        }
        setItems(result.consultations || []);
      } catch {
        setMessage("امکان دریافت اطلاعات کاربر وجود ندارد. لطفاً دوباره تلاش کنید.");
      } finally {
        window.clearTimeout(timeout);
        setLoading(false);
      }
    };
    load();
  }, []);

  return <div className="bg-black/50 rounded-lg p-6 text-white">
    <h1 className="text-2xl font-bold text-[#d4af37] mb-6">درخواست مشاوره‌های من</h1>
    {loading ? <p className="text-gray-400">در حال بارگذاری...</p> : message ? <div className="rounded-lg border border-amber-400/30 p-8 text-center text-amber-200">{message}</div> : items.length === 0 ? <div className="rounded-lg border border-white/10 p-8 text-center text-gray-400">هنوز درخواست مشاوره‌ای ثبت نکرده‌اید.</div> : <div className="space-y-4">
      {items.map((item) => <article key={item.id} className="bg-gray-800 rounded-lg p-4 border border-[#d4af37]/30">
        <div className="flex justify-between gap-3 items-start mb-3"><span className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</span><span className="bg-blue-600 text-xs px-3 py-1 rounded-full">{item.status === "pending" ? "در انتظار بررسی" : item.status || "در انتظار بررسی"}</span></div>
        <h3 className="text-lg font-semibold text-[#d4af37] mb-2">{item.consultationType}</h3>
        <p className="text-gray-400 text-sm">{item.description}</p>
      </article>)}
    </div>}
  </div>;
}
