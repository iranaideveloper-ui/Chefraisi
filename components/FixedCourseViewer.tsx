"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, CheckCircle2, LockKeyhole, Play, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CourseLessonsDialog, { type CourseVideoLesson } from "@/components/CourseLessonsDialog";

export type FixedCourseViewData = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  isFree: boolean;
  comingSoon: boolean;
  purchased: boolean;
  lessons: CourseVideoLesson[];
};

export default function FixedCourseViewer({ course }: { course: FixedCourseViewData }) {
  const router = useRouter();
  const { items, addToCart } = useCart();
  const [playerAccess, setPlayerAccess] = useState<"preview" | "full" | null>(null);
  const previewCount = course.lessons.filter((lesson) => lesson.isFreePreview && lesson.videoUrl).length;
  const hasFullAccess = course.isFree || course.purchased;

  const startCheckout = () => {
    if (!items.some((item) => item.id === course.id)) {
      addToCart(course.id, course.title, course.price, { originalPrice: course.price });
    }
    router.push("/user-panel/cart");
  };

  return (
    <main className="viewport-min-height overflow-x-hidden bg-[#0a0a09] px-4 pb-16 pt-28 text-white selection:bg-[#d4af37] selection:text-[#0a0a09] sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link href="/#menu" className="inline-flex min-h-10 items-center text-sm font-semibold text-stone-400 transition hover:text-[#d4af37]">بازگشت به دوره‌ها</Link>
        <section className="mt-5 grid overflow-hidden border border-[#d4af37]/30 bg-[#11110f] lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="relative min-h-64 bg-black sm:min-h-96">
            <Image src={course.image} alt={course.title} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
            {course.comingSoon && <span className="absolute right-4 top-4 border border-[#d4af37]/60 bg-black/75 px-3 py-2 text-sm font-bold text-[#f5d77d]">به‌زودی منتشر می‌شود</span>}
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
            <p className="text-sm font-bold text-[#d4af37]">فراز برتر رامونا</p>
            <h1 className="mt-3 break-words text-2xl font-black leading-relaxed text-stone-100 sm:text-3xl">{course.title}</h1>
            <p className="mt-4 break-words text-sm leading-8 text-stone-300 sm:text-base">{course.description}</p>

            {course.comingSoon ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex min-h-11 items-center gap-2 border border-[#d4af37]/30 bg-[#d4af37]/5 px-4 text-sm font-semibold text-[#f5d77d]"><BookOpen className="h-4 w-4" />پیش‌ثبت‌نام به‌زودی فعال می‌شود</span>
                <Link href="/#contact" className="inline-flex min-h-11 items-center justify-center border border-white/15 px-4 text-sm font-semibold text-stone-200 transition hover:border-[#d4af37] hover:text-[#f5d77d]">اطلاع از انتشار</Link>
              </div>
            ) : hasFullAccess ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setPlayerAccess("full")} disabled={!course.lessons.length} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#d4af37] px-5 font-bold text-[#120f09] transition hover:bg-[#e6c65e] disabled:cursor-not-allowed disabled:opacity-50">
                  <Play className="h-4 w-4" /> مشاهده دوره ({course.lessons.length.toLocaleString("fa-IR")} قسمت)
                </button>
                {course.purchased && <span className="inline-flex items-center gap-1.5 text-sm text-green-300"><CheckCircle2 className="h-4 w-4" />دوره در حساب شما فعال است</span>}
                {!course.lessons.length && <p className="w-full text-sm text-stone-400">ویدیوهای این دوره به‌زودی اضافه می‌شوند.</p>}
              </div>
            ) : (
              <div className="mt-7 border border-[#d4af37]/35 bg-black/30 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[#d4af37]" />
                  <div>
                    <h2 className="font-bold text-stone-100">دسترسی کامل با ثبت‌نام در دوره</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-400">{course.lessons.length.toLocaleString("fa-IR")} قسمت آموزشی · دسترسی پس از تأیید پرداخت زرین‌پال</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-lg font-extrabold text-[#f5d77d]">{course.price.toLocaleString("fa-IR")} تومان</span>
                  <button type="button" onClick={startCheckout} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#d4af37] px-4 py-2 text-sm font-bold text-[#120f09] transition hover:bg-[#e6c65e]">
                    <ShoppingCart className="h-4 w-4" /> خرید دوره و دریافت آنی دسترسی
                  </button>
                </div>
                {previewCount > 0 && <button type="button" onClick={() => setPlayerAccess("preview")} className="mt-4 min-h-10 text-sm font-semibold text-[#f5d77d] underline decoration-[#d4af37]/50 underline-offset-4">مشاهده {previewCount.toLocaleString("fa-IR")} قسمت رایگان</button>}
              </div>
            )}
          </div>
        </section>

        {!course.comingSoon && course.lessons.length > 0 && (
          <section className="mt-8 border-y border-white/10 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-bold text-stone-100">سرفصل‌های دوره</h2><p className="mt-1 text-sm text-stone-400">{course.lessons.length.toLocaleString("fa-IR")} جلسه آموزشی</p></div>
              {!hasFullAccess && <span className="inline-flex items-center gap-2 text-xs text-stone-400"><LockKeyhole className="h-4 w-4 text-[#d4af37]" />قسمت‌های قفل‌شده پس از خرید فعال می‌شوند</span>}
            </div>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...course.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((lesson, index) => {
                const playable = hasFullAccess || lesson.isFreePreview;
                return <li key={lesson._id ?? `${lesson.order ?? index}-${lesson.title}`} className="flex min-h-14 min-w-0 items-center gap-3 border border-white/10 bg-white/[0.02] px-3 py-2"><span className="shrink-0 text-xs text-[#d4af37]">{String(index + 1).padStart(2, "۰")}</span><span className="min-w-0 flex-1"><span className="block line-clamp-1 break-words text-sm font-semibold text-stone-200">{lesson.title}</span><span className="text-xs text-stone-500">{playable ? lesson.isFreePreview ? "پیش‌نمایش رایگان" : "قابل مشاهده" : "نیاز به ثبت‌نام"}{lesson.duration ? ` · ${lesson.duration}` : ""}</span></span>{playable ? <Play className="h-4 w-4 shrink-0 text-[#d4af37]" /> : <LockKeyhole className="h-4 w-4 shrink-0 text-stone-500" />}</li>;
              })}
            </ol>
          </section>
        )}
      </div>
      {playerAccess && <CourseLessonsDialog key={`${course.slug}-${playerAccess}`} courseTitle={course.title} lessons={course.lessons} access={playerAccess} onClose={() => setPlayerAccess(null)} />}
    </main>
  );
}