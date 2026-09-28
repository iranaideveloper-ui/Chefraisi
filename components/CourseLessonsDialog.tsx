"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LockKeyhole, Play, X } from "lucide-react";

export type CourseVideoLesson = {
  _id?: string;
  title: string;
  videoUrl?: string;
  duration?: string;
  isFreePreview?: boolean;
  order?: number;
};

type CourseLessonsDialogProps = {
  courseTitle: string;
  lessons: CourseVideoLesson[];
  access: "preview" | "full";
  onClose: () => void;
};

export default function CourseLessonsDialog({
  courseTitle,
  lessons,
  access,
  onClose,
}: CourseLessonsDialogProps) {
  const orderedLessons = useMemo(
    () => [...lessons].sort((left, right) => (left.order ?? 0) - (right.order ?? 0)),
    [lessons],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIndex(Math.max(0, orderedLessons.findIndex((lesson) => canPlay(lesson, access))));
    setCompletedLessons(new Set());
  }, [access, orderedLessons]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (lessons.length === 0) return null;

  const activeLesson = orderedLessons[selectedIndex];
  const activeAllowed = activeLesson ? canPlay(activeLesson, access) : false;
  const activeKey = activeLesson ? lessonKey(activeLesson, selectedIndex) : "";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-lessons-title"
        className="max-h-[92dvh] w-full max-w-6xl overflow-y-auto border border-[#d4af37]/40 bg-[#0c0d10] text-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0c0d10]/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#d4af37]">پخش دوره</p>
            <h2 id="course-lessons-title" className="mt-1 line-clamp-1 break-words font-bold text-stone-100">{courseTitle}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن پخش دوره" className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-stone-300 transition hover:border-[#d4af37] hover:text-[#f5d77d]">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 p-3 sm:p-5">
            <div className="aspect-video overflow-hidden border border-white/10 bg-black">
              {activeLesson?.videoUrl && activeAllowed ? (
                <video
                  key={activeKey}
                  src={activeLesson.videoUrl}
                  controls
                  playsInline
                  controlsList="nodownload"
                  className="h-full w-full bg-black object-contain"
                  onEnded={() => setCompletedLessons((current) => new Set(current).add(activeKey))}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-stone-400">
                  {activeLesson && !activeAllowed ? <LockKeyhole className="h-8 w-8 text-[#d4af37]" /> : <Play className="h-8 w-8 text-[#d4af37]" />}
                  <p className="text-sm">{activeLesson && !activeAllowed ? "برای تماشای این قسمت در دوره ثبت‌نام کنید." : "این دوره هنوز ویدیویی ندارد."}</p>
                </div>
              )}
            </div>
            {activeLesson && (
              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-bold text-stone-100">{activeLesson.title}</h3>
                  {activeLesson.duration && <p className="mt-1 text-sm text-stone-400">مدت: {activeLesson.duration}</p>}
                </div>
                {access === "preview" && activeLesson.isFreePreview && <span className="border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-xs font-semibold text-green-300">پیش‌نمایش رایگان</span>}
              </div>
            )}
          </div>

          <aside className="border-t border-white/10 lg:border-r lg:border-t-0">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="font-bold text-stone-100">فهرست قسمت‌ها</h3>
              <span className="text-xs text-stone-400">{lessons.length} قسمت</span>
            </div>
            <ol className="max-h-80 divide-y divide-white/5 overflow-y-auto lg:max-h-[32rem]">
              {orderedLessons.map((lesson, index) => {
                const key = lessonKey(lesson, index);
                const allowed = canPlay(lesson, access);
                const selected = index === selectedIndex;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      disabled={!allowed}
                      onClick={() => setSelectedIndex(index)}
                      className={`flex min-h-16 w-full items-center gap-3 px-4 py-3 text-right transition ${selected ? "bg-[#d4af37]/10" : "hover:bg-white/5"} disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 text-xs text-stone-400">
                        {completedLessons.has(key) ? <Check className="h-4 w-4 text-green-400" /> : allowed ? <Play className="h-3.5 w-3.5 text-[#d4af37]" /> : <LockKeyhole className="h-4 w-4 text-stone-500" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block line-clamp-2 break-words text-sm font-semibold text-stone-200">{lesson.title}</span>
                        <span className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-stone-500">
                          {lesson.duration && <span>{lesson.duration}</span>}
                          {!allowed && <span>نیاز به ثبت‌نام در دوره</span>}
                          {access === "preview" && allowed && <span className="text-green-400">پیش‌نمایش رایگان</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </section>
    </div>
  );
}

function canPlay(lesson: CourseVideoLesson, access: "preview" | "full") {
  return Boolean(lesson.videoUrl) && (access === "full" || lesson.isFreePreview === true);
}

function lessonKey(lesson: CourseVideoLesson, index: number) {
  return lesson._id || `${lesson.order ?? index}-${lesson.title}`;
}