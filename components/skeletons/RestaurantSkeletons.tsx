type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl border border-amber-500/10 bg-zinc-800/80 ${className}`}
    />
  );
}

type CourseCardSkeletonProps = SkeletonProps & {
  showButton?: boolean;
};

export function CourseCardSkeleton({ className = "", showButton = true }: CourseCardSkeletonProps) {
  return (
    <article
      dir="rtl"
      aria-hidden="true"
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-amber-500/10 bg-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.2)] ${className}`}
    >
      <div className="relative">
        <Skeleton className="aspect-[3/2] w-full rounded-none border-0 bg-zinc-800" />
        <Skeleton className="absolute right-3 top-3 h-6 w-20 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Skeleton className="mt-1 h-6 w-4/5 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-full rounded-lg" />
        <Skeleton className="mt-2 h-4 w-3/5 rounded-lg" />
        <div className="mt-5 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
        {showButton && <Skeleton className="mt-5 h-11 w-full rounded-xl" />}
      </div>
    </article>
  );
}

export function DepartmentCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <article
      dir="rtl"
      aria-hidden="true"
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-amber-500/10 bg-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.2)] ${className}`}
    >
      <div className="relative">
        <Skeleton className="aspect-[3/2] w-full rounded-none border-0 bg-zinc-800" />
        <Skeleton className="absolute right-3 top-3 h-6 w-24 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Skeleton className="h-6 w-4/5 rounded-lg" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-4 w-3/4 rounded-lg" />
        <Skeleton className="mt-5 h-4 w-28 rounded-lg" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function ProjectSkeleton({ className = "" }: SkeletonProps) {
  return <DepartmentCardSkeleton className={className} />;
}

type CoursesGridSkeletonProps = SkeletonProps & {
  count?: number;
};

export function CoursesGridSkeleton({ count = 6, className = "" }: CoursesGridSkeletonProps) {
  const cardCount = Math.min(6, Math.max(3, Math.floor(count)));

  return (
    <div
      dir="rtl"
      aria-busy="true"
      aria-label="در حال بارگذاری دوره‌ها"
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {Array.from({ length: cardCount }, (_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
