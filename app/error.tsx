'use client';

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCcw } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-zinc-100 pb-[env(safe-area-inset-bottom,20px)] sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(180,125,35,0.13),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(120,53,15,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(86vw,36rem)] w-[min(86vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/10 shadow-[0_0_100px_rgba(217,119,6,0.08)]" />

      <section className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/25 bg-amber-500/10 text-amber-400 shadow-[0_0_45px_rgba(245,158,11,0.16)]">
          <AlertTriangle aria-hidden="true" className="h-9 w-9" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
          خطایی رخ داده است
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-8 text-zinc-400 sm:text-base">
          متأسفانه در پردازش درخواست شما مشکلی پیش آمده است. نگران نباشید، داده‌های شما محفوظ هستند.
        </p>

        <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-l from-amber-500 to-yellow-600 px-6 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(217,119,6,0.18)] transition hover:from-amber-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <RefreshCcw aria-hidden="true" className="h-4 w-4" />
            تلاش مجدد
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-white/3% px-6 text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            بازگشت به صفحه اصلی
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
