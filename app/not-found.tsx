import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-zinc-100 pb-[env(safe-area-inset-bottom,20px)] sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(180,125,35,0.14),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(120,53,15,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vw,34rem)] w-[min(78vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/10 shadow-[0_0_100px_rgba(217,119,6,0.08)]" />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.14)] sm:mb-9">
          <Compass aria-hidden="true" className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <p className="bg-linear-to-b from-amber-200 via-amber-400 to-yellow-700 bg-clip-text text-[clamp(7rem,26vw,13rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-transparent drop-shadow-[0_0_28px_rgba(245,158,11,0.2)]">
          404
        </p>
        <div className="mt-8 h-px w-20 bg-linear-to-r from-transparent via-amber-500/70 to-transparent sm:mt-10" />

        <h1 className="mt-7 text-2xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
          صفحه مورد نظر پیدا نشد
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-8 text-zinc-400 sm:text-base">
          آدرسی که وارد کرده‌اید وجود ندارد یا ممکن است جابه‌جا شده باشد.
        </p>

        <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-l from-amber-500 to-yellow-600 px-6 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(217,119,6,0.18)] transition hover:from-amber-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
          <Link
            href="/#contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-white/3% px-6 text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            تماس با ما
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
