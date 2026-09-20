import { CoursesGridSkeleton } from "@/components/skeletons/RestaurantSkeletons";

export default function Loading() {
  return (
    <section
      dir="rtl"
      aria-label="در حال بارگذاری دوره‌ها"
      className="min-h-[40dvh] w-full rounded-2xl bg-zinc-950 p-4 text-white sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-zinc-800/80" aria-hidden="true" />
        <div className="h-9 w-24 animate-pulse rounded-xl border border-amber-500/10 bg-zinc-900" aria-hidden="true" />
      </div>
      <CoursesGridSkeleton count={6} />
    </section>
  );
}
