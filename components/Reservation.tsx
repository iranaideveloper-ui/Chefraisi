"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const defaultConsultationServices = [
  { title: "مشاوره تخصصی", description: "بررسی بازار، تحلیل رقبا و برنامه‌ریزی دقیق برای رشد کسب‌وکار." },
  { title: "طراحی و معماری", description: "طراحی داخلی حرفه‌ای، چیدمان و تجربه مشتری‌محور برای فضا." },
  { title: "آموزش و راه‌اندازی", description: "آموزش تیم، سرویس‌دهی، سیستم‌های عملیاتی و اجرا در سطح حرفه‌ای." },
  { title: "برندسازی و بازاریابی", description: "ساخت هویت متمایز و طراحی مسیر جذب و حفظ مشتریان هدف." },
  { title: "مدیریت و توسعه", description: "بهینه‌سازی عملیات، کنترل هزینه‌ها و برنامه‌ریزی برای رشد پایدار." },
];

const consultationOptions = [
  "راهنمایی اولیه",
  "آموزش",
  "مشاوره تخصصی",
  "راه‌اندازی",
  "بسته کامل (راه‌اندازی + آموزش + مشاوره تخصصی)",
];

export default function Reservation() {
  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [description, setDescription] = useState("");
  const [consultationServices, setConsultationServices] = useState(defaultConsultationServices);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/consultation-services", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => { if (Array.isArray(result.services) && result.services.length === 5) setConsultationServices(result.services); })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          family,
          phone,
          email,
          consultationType,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
        return;
      }

      setName("");
      setFamily("");
      setPhone("");
      setEmail("");
      setConsultationType("");
      setDescription("");
      setMessage("درخواست شما با موفقیت ثبت شد. تیم ما در کوتاه‌ترین زمان با شما تماس خواهد گرفت.");
    } catch (error) {
      console.error(error);
      setMessage("خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reservation"
      className="relative flex items-center justify-center bg-[#090909] bg-[url('/assets/images/bg-offer.png')] bg-center bg-no-repeat px-3 py-12 sm:px-0 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl rounded-[30px] border border-[#d4af37]/40 bg-[#0d0d0d]/80 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-6 md:p-8">
        <div className="mb-8 flex items-center justify-center gap-3 text-center text-white">
          <Image
            src="/assets/images/advantage-2.png"
            alt="برگ"
            className="h-10 w-10 sm:h-12 sm:w-12"
            width={128}
            height={128}
          />
          <span className="text-2xl font-extrabold sm:text-3xl">درخواست مشاوره</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.05fr_1.35fr]">
          <div className="rounded-[26px] border border-[#d4af37]/40 bg-[#121212]/90 p-6 text-right shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:p-7">
            <h3 className="mb-3 text-2xl font-extrabold text-white">خدمات مشاوره‌ای ما</h3>
            <p className="mb-5 text-sm leading-7 text-gray-300">
              ما در تمام مراحل احداث، توسعه و راه‌اندازی رستوران‌های حرفه‌ای در کنار شما هستیم؛ از ایده اولیه تا اجرای نهایی و آموزش تیم.
            </p>

            <div className="space-y-4 divide-y divide-white/10">
              {consultationServices.map((service) => <div key={service.title} className="py-4 first:pt-1 last:pb-1"><span className="block text-sm font-bold text-[#d4af37]">{service.title}</span><p className="mt-1 text-xs leading-6 text-gray-400">{service.description}</p></div>)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-[26px] border border-[#d4af37]/40 bg-[#111111]/90 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:grid-cols-2 sm:p-6">
            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="name" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">نام</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام"
                required
                className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>

            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="family" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">نام خانوادگی</label>
              <input
                id="family"
                type="text"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                placeholder="نام خانوادگی"
                required
                className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>

            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="phone" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">شماره تماس</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="شماره تماس"
                required
                className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>

            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="email" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">ایمیل</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل"
                required
                className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label htmlFor="consultationType" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">نوع مشاوره</label>
              <select
                id="consultationType"
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                required
                className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              >
                <option value="">انتخاب کنید</option>
                {consultationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label htmlFor="description" className="mb-2 text-xs font-bold text-[#d4af37] sm:text-sm">توضیحات</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات بیشتری درباره پروژه یا هدف خود بنویسید..."
                className="h-28 resize-none rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="mb-3 text-xs leading-6 text-gray-300">
                پس از ثبت درخواست، تیم ما در کوتاه‌ترین زمان با شما تماس می‌گیرد تا جزئیات پروژه را بررسی کند.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#d4af37] py-3 text-sm font-extrabold text-[#110d06] shadow-[0_12px_26px_rgba(212,175,55,0.35)] transition hover:bg-[#e6c65e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "در حال ثبت..." : "ارسال درخواست مشاوره"}
              </button>

              {message && <p className="mt-3 text-center text-sm text-amber-300">{message}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
