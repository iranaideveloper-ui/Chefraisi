"use client";

import { useEffect, useState } from "react";
import { defaultAboutContent, type AboutContent } from "@/lib/aboutContent";
import ImageUpload from "@/components/admin/ImageUpload";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20";

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={inputClass} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />}</label>;
}

export default function AdminAbout() {
  const [about, setAbout] = useState<AboutContent>(defaultAboutContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/about", { credentials: "include", cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "بارگذاری اطلاعات انجام نشد"); return result.content as AboutContent; })
      .then(setAbout)
      .catch((error: Error) => setMessage({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => setAbout((current) => ({ ...current, [key]: value }));
  const updateArray = <K extends "slides" | "highlights" | "services" | "process">(key: K, index: number, value: AboutContent[K][number]) => setAbout((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item) }));

  const save = async () => {
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/about", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(about) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ذخیره اطلاعات انجام نشد");
      setAbout({ ...defaultAboutContent, ...result.content });
      setMessage({ type: "success", text: "محتوای صفحه درباره ما با موفقیت ذخیره شد." });
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "ذخیره اطلاعات انجام نشد" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">در حال بارگذاری محتوای درباره ما...</div>;

  return <div className="space-y-6 rounded-xl bg-white p-5 shadow sm:p-7" dir="rtl">
    <div className="border-b border-gray-200 pb-5"><h1 className="text-2xl font-black text-gray-800">مدیریت حرفه‌ای درباره ما</h1><p className="mt-2 text-sm text-gray-500">متن‌ها و تصاویر همین صفحه در سایت عمومی از این بخش مدیریت می‌شوند.</p></div>
    {message && <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{message.text}</div>}

    <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-6"><h2 className="text-lg font-bold text-gray-800">هرو و معرفی اولیه</h2><div className="grid gap-4 md:grid-cols-2"><Field label="عنوان اصلی" value={about.heroTitle} onChange={(value) => update("heroTitle", value)} /><Field label="عنوان طلایی" value={about.heroAccent} onChange={(value) => update("heroAccent", value)} /><Field label="متن معرفی" value={about.heroDescription} multiline onChange={(value) => update("heroDescription", value)} /><Field label="متن لینک پشتیبانی" value={about.supportText} onChange={(value) => update("supportText", value)} /><Field label="لینک پشتیبانی" value={about.supportLink} onChange={(value) => update("supportLink", value)} /></div></section>

    <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-6"><div><h2 className="text-lg font-bold text-gray-800">اسلایدهای تصویری</h2></div><div className="grid gap-4 lg:grid-cols-2">{about.slides.map((slide, index) => <div key={index} className="space-y-3 rounded-lg bg-gray-50 p-4"><div><b>اسلاید {index + 1}</b></div><ImageUpload label="تصویر اسلاید" value={slide.image} onChange={(value) => updateArray("slides", index, { ...slide, image: value })} /><Field label="برچسب" value={slide.label} onChange={(value) => updateArray("slides", index, { ...slide, label: value })} /><Field label="توضیح کوتاه" value={slide.detail} onChange={(value) => updateArray("slides", index, { ...slide, detail: value })} /></div>)}</div></section>

    <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-6"><h2 className="text-lg font-bold text-gray-800">مزیت‌های کوتاه</h2>{about.highlights.map((item, index) => <div key={index} className="flex gap-2"><input value={item.label} onChange={(event) => updateArray("highlights", index, { label: event.target.value })} className={inputClass} /></div>)}</section>

    <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-6"><h2 className="text-lg font-bold text-gray-800">خدمات</h2>{about.services.map((service, index) => <div key={index} className="space-y-3 rounded-lg bg-gray-50 p-4"><div><b>خدمت {index + 1}</b></div><div className="grid gap-3 md:grid-cols-3"><Field label="شماره" value={service.number} onChange={(value) => updateArray("services", index, { ...service, number: value })} /><Field label="عنوان" value={service.title} onChange={(value) => updateArray("services", index, { ...service, title: value })} /><Field label="توضیح" value={service.description} onChange={(value) => updateArray("services", index, { ...service, description: value })} /></div><label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">موارد خدمت، هر مورد در یک خط</span><textarea value={service.items.join("\n")} onChange={(event) => updateArray("services", index, { ...service, items: event.target.value.split("\n") })} rows={4} className={inputClass} /></label></div>)}</section>

    <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-6"><h2 className="text-lg font-bold text-gray-800">روش همکاری و فراخوان پایانی</h2><div className="grid gap-4 md:grid-cols-2"><Field label="عنوان روش همکاری" value={about.processTitle} onChange={(value) => update("processTitle", value)} /><Field label="توضیح روش همکاری" value={about.processDescription} multiline onChange={(value) => update("processDescription", value)} /><ImageUpload label="تصویر پس‌زمینه روش همکاری" value={about.processImage} onChange={(value) => update("processImage", value)} /><Field label="عنوان پایانی" value={about.ctaTitle} onChange={(value) => update("ctaTitle", value)} /><Field label="توضیح پایانی" value={about.ctaDescription} multiline onChange={(value) => update("ctaDescription", value)} /><Field label="متن دکمه پایانی" value={about.ctaButton} onChange={(value) => update("ctaButton", value)} /></div>{about.process.map((step, index) => <div key={index} className="grid gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2"><Field label={`مرحله ${index + 1}`} value={step.title} onChange={(value) => updateArray("process", index, { ...step, title: value })} /><Field label="توضیح مرحله" value={step.text} multiline onChange={(value) => updateArray("process", index, { ...step, text: value })} /></div>)}</section>

    <div className="sticky bottom-4 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg"><button type="button" onClick={save} disabled={saving} className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-60">{saving ? "در حال ذخیره..." : "ذخیره همه تغییرات"}</button></div>
  </div>;
}
