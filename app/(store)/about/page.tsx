import type { Metadata } from "next";
import AboutHero from "@/components/AboutHero";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  ChefHat,
  CircleCheck,
  Compass,
  Hammer,
  Lightbulb,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { getAboutContent } from "@/lib/getAboutContent";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "آشنایی با فراز برتر رامونا و تجربه ما در مشاوره، طراحی و راه‌اندازی رستوران.",
  alternates: { canonical: "/about" },
};

export default async function About() {
  const content = await getAboutContent();
  const serviceIcons = [Compass, Palette, Hammer, ChefHat];
  const processIcons = [Lightbulb, Boxes, ShieldCheck];

  return (
    <main className="viewport-min-height overflow-x-hidden bg-[#0a0a09] text-white selection:bg-[#d4af37] selection:text-[#0a0a09]">
      <AboutHero content={content} />

      <section className="border-b border-white/10 bg-[#11110f] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
          {content.highlights.map(({ label }, index) => {
            const Icon = [BriefcaseBusiness, BadgeCheck, Sparkles][index] ?? Sparkles;
            return (
            <div key={label} className="flex items-center gap-4 border border-white/10 bg-white/2 px-4 py-4 text-stone-300 transition-colors hover:border-[#d4af37]/45 hover:bg-[#d4af37]/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d4af37]/35 text-[#d4af37]"><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 bg-[#d4af37]/4 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold text-[#d4af37]">خدمات ما</p>
              <h2 className="text-3xl font-black sm:text-4xl">همه‌چیز برای ساختن یک برند غذایی</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-stone-400">یک تیم واحد، برای تصمیم‌هایی که باید در کنار هم گرفته شوند.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {content.services.map(({ number, title, description, items }, index) => {
              const Icon = serviceIcons[index] ?? Compass;
              return (
              <article key={title} className="group relative overflow-hidden border border-white/10 bg-[#121211] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-8">
                <div className="pointer-events-none absolute right-0 top-0 h-px w-0 bg-[#d4af37] transition-all duration-500 group-hover:w-full" />
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"><Icon className="h-6 w-6" /></div>
                  <span className="font-mono text-sm text-stone-600">{number}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-stone-100">{title}</h3>
                <p className="mt-2 text-sm text-[#d4af37]">{description}</p>
                <ul className="mt-7 space-y-4 border-t border-white/10 pt-6">
                  {items.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-stone-300"><CircleCheck className="mt-1 h-4 w-4 shrink-0 text-[#d4af37]" />{item}</li>)}
                </ul>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-[#d4af37]/30 bg-[#17150e] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <Image src={content.processImage} alt="نمونه‌ای از مسیر اجرای پروژه" fill sizes="100vw" className="-z-20 object-cover object-center opacity-35 saturate-125" />
        <div className="absolute inset-0 -z-10 bg-linear-to-l from-[#17150e]/98 via-[#17150e]/88 to-[#17150e]/45" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="mb-3 text-sm font-bold text-[#f5d77d]">روش همکاری</p><h2 className="text-3xl font-black sm:text-4xl">{content.processTitle}</h2><p className="mt-4 text-sm leading-7 text-stone-300">{content.processDescription}</p></div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {content.process.map(({ title, text }, index) => { const Icon = processIcons[index] ?? Lightbulb; return <div key={title} className="relative border border-white/15 bg-black/20 p-5 backdrop-blur-sm transition-colors hover:border-[#d4af37]/70"><span className="font-mono text-xs text-[#f5d77d]">۰{index + 1}</span><Icon className="absolute left-5 top-5 h-5 w-5 text-[#d4af37]" /><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-stone-300">{text}</p></div>; })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-16 text-center sm:px-8 lg:py-24">
        <Store className="mx-auto mb-5 h-7 w-7 text-[#d4af37]" />
        <h2 className="text-3xl font-black sm:text-4xl">{content.ctaTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-400">{content.ctaDescription}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <Link href="/#reservation" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#d4af37] px-7 py-3 font-bold text-[#120f09] shadow-[0_10px_30px_rgba(212,175,55,0.22)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#e6c65e]">
            {content.ctaButton} <ArrowLeft className="h-4 w-4" />
          </Link>
          <Image
            src="/assets/images/faraz-logo.png"
            alt="لوگوی فراز برتر رامونا"
            width={112}
            height={112}
            className="h-28 w-28 object-contain drop-shadow-[0_10px_25px_rgba(212,175,55,0.22)] sm:h-32 sm:w-32"
          />
        </div>
      </section>
    </main>
  );
}