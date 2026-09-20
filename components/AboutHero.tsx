"use client";

import Image from "next/image";
import { ArrowLeft, Download, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import type { AboutContent } from "@/lib/aboutContent";

export default function AboutHero({ content }: { content: AboutContent }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % content.slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [content.slides.length, isPaused]);

  const slide = content.slides[activeSlide] ?? content.slides[0];
  const chatHref = content.supportLink || siteConfig.baleSupportLink || "https://bale.ai/";

  return (
    <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_80%_15%,rgba(212,175,55,0.08),transparent_28%),#0a0a09] px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-20">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#d4af37]/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-2 lg:gap-16" dir="ltr">
        <div
          className="relative order-1 lg:order-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute left-5 top-5 z-10 flex items-center gap-3 text-xs font-bold tracking-[0.24em] text-[#f5d77d] sm:left-7 sm:top-7">
            ABOUT US <span className="h-px w-10 bg-[#d4af37]" />
          </div>
          <div className="relative aspect-4/3 overflow-hidden border border-[#d4af37]/45 bg-[#17150e] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:aspect-5/4">
            {content.slides.map((item, index) => (
              <Image
                key={item.image}
                src={item.image}
                alt={item.label}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain transition-all duration-1000 ${index === activeSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-right sm:p-7" dir="rtl">
              <div>
                <p className="text-sm font-bold text-[#f5d77d]">{slide.label}</p>
                <p className="mt-1 text-xl font-black text-white sm:text-2xl">{slide.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused((paused) => !paused)}
                  aria-label={isPaused ? "ادامه نمایش تصاویر" : "توقف نمایش تصاویر"}
                  className="flex h-9 w-9 items-center justify-center border border-white/35 bg-black/25 text-white transition hover:border-[#d4af37] hover:text-[#f5d77d]"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <span className="font-mono text-xs text-white/80">{String(activeSlide + 1).padStart(2, "0")} / {String(content.slides.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-start gap-2" role="tablist" aria-label="تصاویر درباره ما">
            {content.slides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                role="tab"
                aria-selected={activeSlide === index}
                aria-label={`نمایش تصویر ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 transition-all duration-300 ${activeSlide === index ? "w-10 bg-[#d4af37]" : "w-5 bg-white/25 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        <div className="order-2 text-right lg:order-2" dir="rtl">
          <p dir="ltr" className="mb-5 flex items-center justify-start gap-3 border-l-2 border-[#d4af37] pl-4 text-left text-lg font-bold tracking-[0.18em] text-[#f5d77d] sm:text-xl lg:text-2xl">FARAZ BARTAR RAMONA <span className="h-px w-10 bg-[#d4af37]/70" /></p>
          <h1 className="max-w-3xl text-2xl font-black leading-normal tracking-tight sm:text-4xl lg:text-5xl">
            {content.heroTitle}
            <span className="block text-[#d4af37]">{content.heroAccent}</span>
            تبدیل می‌کنیم.
          </h1>
          <div className="mt-6 border-r border-[#d4af37]/70 pr-6">
            <p className="text-lg leading-9 text-stone-300 sm:text-xl">
              {content.heroDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-start gap-3">
              <a href={chatHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 border border-[#d4af37]/45 px-5 py-3 text-sm font-bold text-[#f5d77d] transition-colors hover:border-[#f5d77d] hover:bg-[#d4af37]/10 hover:text-white">
                {content.supportText} <ArrowLeft className="h-4 w-4" />
              </a>
              <a
                href="/contracts/contract-education-launch.pdf"
                download="contract-education-launch.pdf"
                aria-label="دانلود قرارداد رسمی آموزش و راه‌اندازی"
                className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-sm font-bold text-stone-200 transition-colors hover:border-[#d4af37] hover:bg-white/5 hover:text-[#f5d77d]"
              >
                <Download className="h-4 w-4" />
                دریافت قرارداد رسمی
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}