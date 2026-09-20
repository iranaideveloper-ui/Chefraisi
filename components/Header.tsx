import Image from "next/image";
import Link from "next/link";

const heroBlur =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==";

export default function Header() {
  return (
    <header className="viewport-min-height relative w-full overflow-hidden bg-[oklch(8%_0_0)] text-white">
      <div className="viewport-min-height grid w-full grid-cols-1 md:grid-cols-2">
        <div className="relative order-1 min-h-[55dvh] overflow-hidden md:order-2 viewport-min-height-md">
          <Image
            src="/assets/images/bg-header.png"
            alt="مدیر شرکت فراز برتر رامونا"
            fill
            priority
            placeholder="blur"
            blurDataURL={heroBlur}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[25%_40%] md:object-[28%_center] mask-[radial-gradient(circle_at_center,black_35%,transparent_95%)] md:mask-[radial-gradient(circle_at_center,black_55%,transparent_100%)]"
          />

          <div className="absolute inset-0 hidden bg-linear-to-r from-transparent via-[oklch(8%_0_0)]/10 to-[oklch(8%_0_0)]/60 md:block" />

          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[oklch(8%_0_0)] to-transparent md:hidden" />
        </div>

        <div className="relative order-2 flex items-center bg-[oklch(8%_0_0)] px-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-12 sm:px-8 md:order-1 viewport-min-height-md md:px-10 md:pb-12 lg:px-16 md:max-[1100px]:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.11),transparent_45%)]" />

          <Image
            src="/assets/images/faraz-logo.png"
            alt="لوگوی فراز برتر رامونا"
            width={220}
            height={220}
            className="pointer-events-none absolute left-8 top-1 z-10 h-36 w-36 object-contain md:left-6 md:top-[13%] md:h-44 md:w-44 md:max-[1100px]:left-4 md:max-[1100px]:top-[10%] md:max-[1100px]:h-32 md:max-[1100px]:w-32"
          />

          <div className="relative z-10 w-full max-w-xl text-right" dir="rtl">
            <span className="mb-10 inline-flex w-[calc(100%-9rem)] max-w-none items-center justify-center rounded-3xl border border-[#d4af37] bg-linear-to-br from-[#d4af37]/25 via-[#d4af37]/10 to-transparent px-2 py-3 text-[clamp(1.1rem,5.5vw,1.5rem)] font-black leading-tight tracking-wide text-[#ffe79a] text-shadow-[0_2px_10px_rgba(0,0,0,0.65)] shadow-[0_0_0_1px_rgba(212,175,55,0.2),0_10px_28px_rgba(0,0,0,0.28)] ring-1 ring-[#d4af37]/25 ring-offset-2 ring-offset-[oklch(8%_0_0)] backdrop-blur-sm sm:w-auto sm:max-w-none sm:px-7 sm:py-3.5 sm:text-2xl sm:leading-normal">
              فراز برتر رامونا
            </span>

            <h1 className="text-3xl font-extrabold leading-[1.45] tracking-tight text-white sm:text-4xl lg:text-4xl">
              مشاوره، طراحی، آموزش و
              <span className="mt-1 block text-[#d4af37]">
                راه اندازی رستوران‌ها صفر تا صد
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-8 text-gray-300 sm:text-lg sm:leading-9">
              از ایده تا افتتاح و رشد پایدار؛ همراه شما برای ساخت یک کسب‌وکار
              رستورانی حرفه‌ای، سودآور و ماندگار.
            </p>

            <div className="mt-9 flex flex-wrap justify-end gap-3 sm:gap-4">
              <Link
                href="#reservation"
                aria-label="درخواست مشاوره"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4af37] px-6 py-3 font-bold text-[#120f09] shadow-[0_10px_30px_rgba(212,175,55,0.22)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#e6c65e]"
              >
                درخواست مشاوره
              </Link>

              <Link
                href="#gallery"
                aria-label="راه اندازی‌ها"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4af37]/80 bg-white/3 px-6 py-3 font-bold text-[#d4af37] backdrop-blur-sm transition duration-300 ease-out hover:bg-[#d4af37] hover:text-black"
              >
                راه اندازی ها
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
