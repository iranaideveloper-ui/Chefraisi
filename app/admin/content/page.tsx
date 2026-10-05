"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import CourseLessonsDialog, { type CourseVideoLesson } from "@/components/CourseLessonsDialog";
import { fixedCourses } from "@/data/fixedCourses";

type Category = "cooking" | "design" | "management" | "complete";
type CourseLesson = {
  _id?: string;
  title: string;
  videoUrl: string;
  duration?: string;
  isFreePreview?: boolean;
  order?: number;
};
type Course = {
  _id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  discountedPrice?: number;
  isFree: boolean;
  category: Category;
  lessons?: CourseLesson[];
  slug?: string;
  comingSoon?: boolean;
};
type CourseForm = Omit<
  Course,
  "_id" | "price" | "discountPercent" | "discountedPrice"
> & { price: string; discountPercent: string; lessons: CourseLesson[] };
const imageDimensions = { width: 1200, height: 800 };
const emptyForm: CourseForm = {
  image: "/assets/images/product-1.jpg",
  title: "",
  description: "",
  price: "",
  discountPercent: "0",
  isFree: false,
  category: "cooking",
  lessons: [],
  comingSoon: false,
};
const categoryLabels: Record<Category, string> = {
  cooking: "آشپزی",
  design: "طراحی",
  management: "مدیریت",
  complete: "جامع",
};
const inputClass =
  "mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500";

function getComingSoon(course: Pick<Course, "slug" | "comingSoon">) {
  return course.comingSoon ?? fixedCourses.find((fixed) => fixed.slug === course.slug)?.comingSoon ?? false;
}

export default function AdminContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>(fixedCourses[0].slug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const loadCourses = useCallback(async () => {
    const response = await fetch("/api/admin/courses", {
      credentials: "include",
      cache: "no-store",
    });
    const result = await response.json();
    if (response.ok) {
      const fixedRecords = (result.courses || []).filter((course: Course) => fixedCourses.some((fixed) => fixed.slug === course.slug));
      setCourses(fixedRecords);
      const selected = fixedRecords.find((course: Course) => course.slug === selectedSlug) ?? fixedRecords[0];
      if (selected) {
        setSelectedSlug(selected.slug || fixedCourses[0].slug);
        setEditingId(selected._id);
        setForm({
          image: selected.image,
          title: selected.title,
          description: selected.description,
          price: String(selected.price),
          discountPercent: String(selected.discountPercent || 0),
          isFree: selected.isFree,
          category: selected.category,
          lessons: selected.lessons ?? [],
          comingSoon: getComingSoon(selected),
        });
        setShowForm(true);
      }
    }
    else setMessage(result.error || "دریافت دوره‌ها انجام نشد");
  }, [selectedSlug]);
  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);
  const update = (field: keyof CourseForm, value: string | boolean | CourseLesson[]) =>
    setForm((current) => ({ ...current, [field]: value }));
  const saveCourse = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/courses", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        price: selectedSlug === "free-course" ? 0 : Number(form.price),
        discountPercent: selectedSlug === "free-course" ? 0 : Number(form.discountPercent),
        ...(selectedSlug === "free-course" ? { isFree: true } : {}),
        id: editingId,
      }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error || "ذخیره دوره انجام نشد");
      return;
    }
    setCourses((current) =>
      editingId
        ? current.map((course) =>
            course._id === editingId ? result.course : course,
          )
        : [...current, result.course],
    );
    setMessage(
      editingId ? "دوره با موفقیت ویرایش شد" : "دوره جدید با موفقیت ثبت شد",
    );
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };
  const editCourse = (course: Course) => {
    setEditingId(course._id);
    setForm({
      image: course.image,
      title: course.title,
      description: course.description,
      price: String(course.price),
      discountPercent: String(course.discountPercent || 0),
      isFree: course.isFree,
      category: course.category,
      lessons: course.lessons ?? [],
      comingSoon: getComingSoon(course),
    });
    setShowForm(true);
    setMessage("");
  };
  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت دوره‌ها
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ثبت، ویرایش، حذف، تخفیف و مدیریت تصاویر دوره‌های آموزشی سایت
            </p>
          </div>
        </div>
        <nav aria-label="دوره‌های ثابت" role="tablist" className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fixedCourses.map((fixed) => {
            const active = selectedSlug === fixed.slug;
            const currentCourseTitle = courses.find((course) => course.slug === fixed.slug)?.title;
            return (
              <button
                key={fixed.slug}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedSlug(fixed.slug);
                  const course = courses.find((item) => item.slug === fixed.slug);
                  if (course) editCourse(course);
                }}
                className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${active ? "border-[#d4af37] bg-[#d4af37] text-gray-950" : "border-gray-200 bg-white text-gray-700 hover:border-[#d4af37]"}`}
              >
                {currentCourseTitle || fixed.title}
              </button>
            );
          })}
        </nav>
        {showForm && (
          <CourseForm
            form={form}
            update={update}
            onSubmit={saveCourse}
            saving={saving}
            editing={Boolean(editingId)}
            isFreeCourse={selectedSlug === "free-course"}
          />
        )}
        {message && (
          <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
            {message}
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.filter((course) => course.slug === selectedSlug).map((course) => (
            <article
              key={course._id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="relative aspect-3/2 bg-gray-100">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
                {course.discountPercent > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                    {course.discountPercent}% تخفیف
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-gray-800">{course.title}</h2>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {categoryLabels[course.category]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {course.description}
                </p>
                <p className="mt-2 text-sm font-bold text-amber-700">
                  {course.isFree ? (
                    "رایگان"
                  ) : course.discountPercent > 0 ? (
                    <>
                      <span className="ml-2 text-gray-400 line-through">
                        {course.price.toLocaleString("fa-IR")} تومان
                      </span>
                      {(course.discountedPrice || course.price).toLocaleString(
                        "fa-IR",
                      )}{" "}
                      تومان
                    </>
                  ) : (
                    `${course.price.toLocaleString("fa-IR")} تومان`
                  )}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => editCourse(course)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ویرایش
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseForm({
  form,
  update,
  onSubmit,
  saving,
  editing,
  isFreeCourse,
}: {
  form: CourseForm;
  update: (field: keyof CourseForm, value: string | boolean | CourseLesson[]) => void;
  onSubmit: (event: FormEvent) => void;
  saving: boolean;
  editing: boolean;
  isFreeCourse: boolean;
}) {
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [lessonFileName, setLessonFileName] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState("");
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);
  const [previewLessons, setPreviewLessons] = useState<CourseVideoLesson[] | null>(null);
  const freePreviewCount = form.lessons.filter((lesson) => lesson.isFreePreview).length;

  const uploadLessonVideo = async (file: File): Promise<string | null> => {
    setVideoUploadError("");
    if (file.size === 0 || file.size > 200 * 1024 * 1024) {
      setVideoUploadError("حجم فایل ویدیو باید حداکثر ۲۰۰ مگابایت باشد.");
      return null;
    }
    setIsUploadingLesson(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file, file.name);
      const response = await fetch("/api/admin/courses/upload-video", {
        method: "POST",
        credentials: "include",
        body: uploadData,
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "آپلود ویدیو انجام نشد");
      setLessonVideoUrl(result.url);
      return result.url;
    } catch (error) {
      setVideoUploadError(error instanceof Error ? error.message : "آپلود ویدیو انجام نشد");
      return null;
    } finally {
      setIsUploadingLesson(false);
    }
  };

  const handleLessonFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    try {
      const file = input.files?.[0];
      if (!file) return;
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const allowedExtensions = [".mp4", ".webm", ".mov", ".mkv"];
      const allowedMimeTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/mkv", "application/octet-stream"];
      if (!allowedExtensions.includes(extension) || (file.type && !allowedMimeTypes.includes(file.type))) {
        setLessonVideoFile(null);
        setLessonFileName("");
        setLessonVideoUrl("");
        setVideoUploadError("فقط فایل‌های MP4، WebM، MOV یا MKV مجاز هستند.");
        return;
      }
      setLessonVideoFile(file);
      setLessonFileName(file.name);
      setLessonVideoUrl("");
      await uploadLessonVideo(file);
    } catch (error) {
      setVideoUploadError(error instanceof Error ? error.message : "خواندن فایل ویدیو انجام نشد");
    } finally {
      input.value = "";
    }
  };

  const addLesson = async () => {
    const title = lessonTitle.trim();
    let videoUrl = lessonVideoUrl.trim();
    if (!title || (!lessonVideoFile && !videoUrl)) return;
    if (lessonFreePreview && freePreviewCount >= 2) {
      setVideoUploadError("حداکثر دو قسمت از هر دوره می‌تواند پیش‌نمایش رایگان باشد.");
      return;
    }
    if (!videoUrl && lessonVideoFile) {
      videoUrl = (await uploadLessonVideo(lessonVideoFile)) ?? "";
    }
    if (!videoUrl) return;
    update("lessons", [
      ...form.lessons,
      {
        title,
        videoUrl,
        duration: lessonDuration.trim(),
        isFreePreview: lessonFreePreview,
        order: form.lessons.length,
      },
    ]);
    setLessonTitle("");
    setLessonDuration("");
    setLessonVideoFile(null);
    setLessonFileName("");
    setLessonVideoUrl("");
    setLessonFreePreview(false);
  };

  return (
    <>
    <form
      onSubmit={onSubmit}
      className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2"
    >
      <label className="text-sm font-semibold text-gray-700">
        عنوان دوره
        <input
          required
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          maxLength={90}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-neutral-400">{form.title.length}/90</span>
      </label>
      {!isFreeCourse && (
        <>
          <label className="text-sm font-semibold text-gray-700">
            قیمت اصلی به تومان
            <input
              required={!form.isFree}
              type="number"
              min={form.isFree || form.comingSoon ? "0" : "1"}
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            درصد تخفیف
            <input
              type="number"
              min="0"
              max="99"
              step="1"
              value={form.discountPercent}
              onChange={(event) => update("discountPercent", event.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-gray-500">
              بین ۰ تا ۹۹ درصد؛ قیمت نهایی در سایت خودکار محاسبه می‌شود.
            </span>
          </label>
        </>
      )}
      <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
        توضیحات دوره
        <textarea
          required
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
          maxLength={160}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-neutral-400">{form.description.length}/160</span>
      </label>
      <ImageUpload
        label="تصویر دوره"
        value={form.image}
        onChange={(value) => update("image", value)}
        recommendedDimensions={imageDimensions}
      />
      <label className="text-sm font-semibold text-gray-700">
        دسته‌بندی
        <select
          value={form.category}
          onChange={(event) => update("category", event.target.value)}
          className={inputClass}
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={form.isFree}
          disabled={isFreeCourse}
          onChange={(event) => update("isFree", event.target.checked)}
        />{" "}
        دوره رایگان است
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={form.comingSoon}
          onChange={(event) => update("comingSoon", event.target.checked)}
        />
        به‌زودی منتشر می‌شود
      </label>
      <section className="space-y-4 rounded-lg border border-blue-100 bg-white/70 p-4 sm:col-span-2">
        <div>
          <h3 className="font-bold text-gray-800">مدیریت قسمت‌ها و ویدیوهای دوره</h3>
          <p className="mt-1 text-xs leading-6 text-gray-500">حداکثر دو قسمت را برای پیش‌نمایش رایگان انتخاب کنید؛ ویدیوهای بارگذاری‌شده پس از بررسی دسترسی پخش می‌شوند. لینک‌های خارجی را فقط برای محتوای عمومی به‌کار ببرید. در استقرار production، مسیر COURSE_VIDEO_STORAGE_DIR را روی فضای خصوصی و پایدار سرور تنظیم کنید.</p>
        </div>
        {form.lessons.length > 0 && (
          <div className="space-y-2">
            {form.lessons.map((lesson, index) => (
              <div key={lesson._id ?? `${lesson.title}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="wrap-break-word text-sm font-semibold text-gray-800">{index + 1}. {lesson.title}</p>
                  <p className="mt-1 break-all text-xs text-gray-500" dir="ltr">{lesson.videoUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration}</span>}
                  {lesson.isFreePreview && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">پیش‌نمایش رایگان</span>}
                  <button
                    type="button"
                    onClick={() => {
                      if (!lesson.isFreePreview && freePreviewCount >= 2) {
                        setVideoUploadError("حداکثر دو قسمت از هر دوره می‌تواند پیش‌نمایش رایگان باشد.");
                        return;
                      }
                      setVideoUploadError("");
                      update("lessons", form.lessons.map((item, lessonIndex) => lessonIndex === index ? { ...item, isFreePreview: !item.isFreePreview } : item));
                    }}
                    className="min-h-9 rounded border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                  >
                    {lesson.isFreePreview ? "لغو پیش‌نمایش" : "فعال‌سازی پیش‌نمایش"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLessons([lesson])}
                    className="min-h-9 rounded border border-[#d4af37]/50 px-3 py-1 text-xs font-semibold text-[#806414] hover:bg-[#d4af37]/10"
                  >
                    پخش پیش‌نمایش
                  </button>
                  <button
                    type="button"
                    onClick={() => update("lessons", form.lessons.filter((_, lessonIndex) => lessonIndex !== index).map((item, order) => ({ ...item, order })))}
                    className="min-h-9 rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    حذف قسمت
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-3 rounded border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
            عنوان قسمت
            <input
              value={lessonTitle}
              onChange={(event) => setLessonTitle(event.target.value)}
              maxLength={120}
              className={inputClass}
              placeholder="جلسه اول: مبانی پخت"
            />
            <span className="mt-1 block text-xs text-gray-500">{lessonTitle.length}/120</span>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            مدت زمان (اختیاری)
            <input value={lessonDuration} onChange={(event) => setLessonDuration(event.target.value)} maxLength={20} className={inputClass} placeholder="15:40" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            نشانی ویدیو (برای لینک خارجی)
            <input value={lessonVideoUrl} onChange={(event) => setLessonVideoUrl(event.target.value)} maxLength={2000} dir="ltr" className={inputClass} placeholder="https://..." />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <input
              ref={lessonVideoInputRef}
              type="file"
              accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime,video/x-matroska,video/mkv"
              disabled={isUploadingLesson}
              className="hidden"
              onChange={handleLessonFileChange}
            />
            <button
              type="button"
              onClick={() => lessonVideoInputRef.current?.click()}
              disabled={isUploadingLesson}
              className={`inline-flex min-h-10 items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[#d4af37] disabled:cursor-wait disabled:opacity-60 ${isUploadingLesson ? "cursor-wait" : "cursor-pointer"}`}
            >
              {isUploadingLesson ? "در حال بارگذاری ویدیو..." : "انتخاب فایل ویدیو"}
            </button>
            <span className={`max-w-full break-all text-xs ${lessonFileName ? "font-semibold text-green-700" : "text-red-600"}`}>
              {lessonFileName ? `✓ ویدیو انتخاب شد: ${lessonFileName}` : "فایلی انتخاب نشده است"}
            </span>
            <label className="inline-flex min-h-10 items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={lessonFreePreview} disabled={!lessonFreePreview && freePreviewCount >= 2} onChange={(event) => setLessonFreePreview(event.target.checked)} className="h-4 w-4 accent-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50" />
              پیش‌نمایش رایگان (مشاهده بدون خرید)
            </label>
            <span className="text-xs text-gray-500">پیش‌نمایش‌های انتخاب‌شده: {freePreviewCount}/2</span>
            <button type="button" onClick={() => void addLesson()} disabled={isUploadingLesson || !lessonTitle.trim() || (!lessonVideoFile && !lessonVideoUrl.trim())} className="min-h-10 rounded bg-[#d4af37] px-4 py-2 text-sm font-bold text-gray-950 hover:bg-[#c5a12e] disabled:cursor-not-allowed disabled:opacity-50">
              + افزودن قسمت به دوره
            </button>
            {videoUploadError && <p role="alert" className="w-full text-xs text-red-600">{videoUploadError}</p>}
          </div>
        </div>
      </section>
      <div className="flex items-end">
        <button
          disabled={saving}
          className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50"
        >
          {saving ? "در حال ذخیره..." : editing ? "ذخیره ویرایش" : "ثبت دوره"}
        </button>
      </div>
    </form>
    {previewLessons && <CourseLessonsDialog courseTitle={form.title || "پیش‌نمایش قسمت"} lessons={previewLessons} access="full" onClose={() => setPreviewLessons(null)} />}
    </>
  );
}
