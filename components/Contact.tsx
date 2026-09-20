"use client";

import { useEffect, useState } from "react";
import { BsInstagram, BsPhone, BsWhatsapp } from "react-icons/bs";

const defaults = { phone: "02166516492", whatsapp: "09127351124", instagram: "https://instagram.com/fermo_cafe", bale: "https://bale.ai/" };

export default function Contact() {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => { fetch("/api/site-settings", { cache: "no-store" }).then((response) => response.json()).then((result) => setSettings((current) => ({ ...current, ...result.settings }))).catch(() => undefined); }, []);
  return (
    <section
      id="contact"
      className="py-10 sm:py-16 bg-gray-950 text-center px-4 fade-in"
    >
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d4af37] mb-3 sm:mb-4"
      >
        تماس با ما
      </h2>
      <p className="text-gray-300 mb-5 sm:mb-8 text-sm sm:text-base">
        برای راه‌اندازی پروژه، مشاوره و آموزش با ما تماس بگیرید
      </p>
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-5 sm:gap-8"
      >
        <div
          className="flex h-32 w-full max-w-xs flex-col items-center justify-center rounded-xl bg-gray-800 p-4 sm:h-36 sm:p-5"
        >
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <BsPhone className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-base sm:text-lg">
              تلفن
            </span>
          </div>
          <a href={`tel:${settings.phone}`} dir="ltr" className="text-gray-200 text-sm sm:text-base hover:text-[#d4af37]">{settings.phone}</a>
        </div>
        {/* WhatsApp */}
        <div
          className="flex h-32 w-full max-w-xs flex-col items-center justify-center rounded-xl bg-gray-800 p-4 sm:h-36 sm:p-5"
        >
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <BsWhatsapp className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-yellow-400 text-base sm:text-lg">
              واتساپ
            </span>
          </div>
          <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" dir="ltr" className="text-[#d4af37] text-sm sm:text-base hover:underline">{settings.whatsapp}</a>
        </div>
        <div
          className="flex h-32 w-full max-w-xs flex-col items-center justify-center rounded-xl bg-gray-800 p-4 sm:h-36 sm:p-5"
        >
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <BsInstagram className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-base sm:text-lg">
              اینستاگرام
            </span>
          </div>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d4af37] hover:underline text-sm sm:text-base"
          >
            {settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
          </a>
        </div>
        <a
          href={settings.bale}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ورود به پشتیبانی بله"
          className="group flex h-32 w-full max-w-xs flex-col items-center justify-center rounded-xl border border-[#d4af37]/70 bg-[#d4af37]/20 p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#d4af37] hover:bg-[#d4af37]/30 hover:shadow-[0_8px_24px_rgba(212,175,55,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] active:translate-y-0 sm:h-36 sm:p-5"
        >
          <div className="mb-2 flex w-full flex-col items-center justify-center gap-1 sm:mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4af37]/70 bg-white shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-transform duration-200 group-hover:scale-110" aria-label="لوگوی بله">
              <svg viewBox="0 0 64 64" className="h-6 w-6" role="img" aria-hidden="true">
                <circle cx="32" cy="32" r="27" fill="white" stroke="#d4af37" strokeWidth="5" />
                <path d="M18 32.5 27 42l20-20" fill="none" stroke="#d4af37" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
                <path d="M10 16 19 23" fill="none" stroke="#d4af37" strokeLinecap="round" strokeWidth="5" />
              </svg>
            </span>
            <span className="font-bold text-[#f6d978] text-base sm:text-lg">بله</span>
          </div>
          <span className="text-[#f6d978] text-sm sm:text-base group-hover:underline">پشتیبانی</span>
        </a>
      </div>
    </section>
  );
}