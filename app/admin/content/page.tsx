"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Category = "cooking" | "design" | "management" | "complete";
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
};
type CourseForm = Omit<
  Course,
  "_id" | "price" | "discountPercent" | "discountedPrice"
> & { price: string; discountPercent: string };
const imageDimensions = { width: 1200, height: 800 };
const emptyForm: CourseForm = {
  image: "/assets/images/product-1.jpg",
  title: "",
  description: "",
  price: "",
  discountPercent: "0",
  isFree: false,
  category: "cooking",
};
const categoryLabels: Record<Category, string> = {
  cooking: "آشپزی",
  design: "طراحی",
  management: "مدیریت",
  complete: "جامع",
};
const inputClass =
  "mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500";

export default function AdminContent() {
  const confirm = useConfirmDialog();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const loadCourses = async () => {
    const response = await fetch("/api/admin/courses", {
      credentials: "include",
      cache: "no-store",
    });
    const result = await response.json();
    if (response.ok) setCourses(result.courses || []);
    else setMessage(result.error || "دریافت دوره‌ها انجام نشد");
  };
  useEffect(() => {
    void loadCourses();
  }, []);
  const update = (field: keyof CourseForm, value: string | boolean) =>
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
        price: Number(form.price),
        discountPercent: Number(form.discountPercent),
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
    });
    setShowForm(true);
    setMessage("");
  };
  const deleteCourse = async (id: string) => {
    if (!await confirm({ title: "حذف دوره", description: "این دوره حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    const response = await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "حذف دوره انجام نشد");
      return;
    }
    setCourses((current) => current.filter((course) => course._id !== id));
    setMessage("دوره حذف شد");
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
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            {showForm ? "بستن فرم" : "+ دوره جدید"}
          </button>
        </div>
        {showForm && (
          <CourseForm
            form={form}
            update={update}
            onSubmit={saveCourse}
            saving={saving}
            editing={Boolean(editingId)}
          />
        )}
        {message && (
          <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
            {message}
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
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
                  <button
                    type="button"
                    onClick={() => deleteCourse(course._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
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
}: {
  form: CourseForm;
  update: (field: keyof CourseForm, value: string | boolean) => void;
  onSubmit: (event: FormEvent) => void;
  saving: boolean;
  editing: boolean;
}) {
  return (
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
          className={inputClass}
        />
      </label>
      <label className="text-sm font-semibold text-gray-700">
        قیمت اصلی به تومان
        <input
          required={!form.isFree}
          type="number"
          min="0"
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
      <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
        توضیحات دوره
        <textarea
          required
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
          className={inputClass}
        />
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
          onChange={(event) => update("isFree", event.target.checked)}
        />{" "}
        دوره رایگان است
      </label>
      <div className="flex items-end">
        <button
          disabled={saving}
          className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50"
        >
          {saving ? "در حال ذخیره..." : editing ? "ذخیره ویرایش" : "ثبت دوره"}
        </button>
      </div>
    </form>
  );
}
