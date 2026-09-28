import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course, { type ICourseLesson } from "@/models/Course";
import { coursesData } from "@/data/coursesData";
import { ensureFixedCourses } from "@/lib/ensureFixedCourses";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

const categories = ["cooking", "design", "management", "complete"] as const;
const fields = ["title", "description", "image", "price", "category", "discountPercent"] as const;

function validateLessons(input: unknown): { lessons?: ICourseLesson[]; error?: string } {
  if (input === undefined || input === null) return {};
  if (!Array.isArray(input)) return { error: "فهرست قسمت‌های دوره نامعتبر است" };

  const lessons: ICourseLesson[] = [];
  for (const [index, value] of input.entries()) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { error: `اطلاعات قسمت ${index + 1} نامعتبر است` };
    }
    const lesson = value as Record<string, unknown>;
    const title = typeof lesson.title === "string" ? lesson.title.trim() : "";
    const videoUrl = typeof lesson.videoUrl === "string" ? lesson.videoUrl.trim() : "";
    const duration = lesson.duration == null ? "" : typeof lesson.duration === "string" ? lesson.duration.trim() : null;
    const order = lesson.order == null ? index : lesson.order;

    if (!title || title.length > 120) return { error: `عنوان قسمت ${index + 1} الزامی است و حداکثر ۱۲۰ کاراکتر دارد` };
    if (!videoUrl || videoUrl.length > 2000 || !isAllowedVideoUrl(videoUrl)) {
      return { error: `نشانی ویدیوی قسمت ${index + 1} نامعتبر است` };
    }
    if (duration === null || duration.length > 20) return { error: `زمان قسمت ${index + 1} نامعتبر است` };
    if (lesson.isFreePreview != null && typeof lesson.isFreePreview !== "boolean") {
      return { error: `وضعیت پیش‌نمایش قسمت ${index + 1} نامعتبر است` };
    }
    if (typeof order !== "number" || !Number.isInteger(order) || order < 0) {
      return { error: `ترتیب قسمت ${index + 1} نامعتبر است` };
    }

    lessons.push({
      title,
      videoUrl,
      duration,
      isFreePreview: lesson.isFreePreview === true,
      order,
    });
  }
  return { lessons };
}

function isAllowedVideoUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(body: Record<string, unknown>) {
  const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]]));
  if (typeof values.title === "string" && values.title.length > 90) return { error: "عنوان دوره نمی‌تواند بیشتر از ۹۰ کاراکتر باشد" };
  if (typeof values.description === "string" && values.description.length > 160) return { error: "توضیحات دوره نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد" };
  const lessonResult = validateLessons(body.lessons);
  if (lessonResult.error) return { error: lessonResult.error };
  if (fields.some((field) => !values[field] && values[field] !== 0)) return { error: "تکمیل اطلاعات اصلی دوره الزامی است" };
  if (typeof values.price !== "number" || !Number.isFinite(values.price) || values.price < 0) return { error: "قیمت دوره نامعتبر است" };
  if (typeof values.discountPercent !== "number" || !Number.isInteger(values.discountPercent) || values.discountPercent < 0 || values.discountPercent > 99) return { error: "درصد تخفیف باید عددی بین ۰ تا ۹۹ باشد" };
  if (!categories.includes(values.category as (typeof categories)[number])) return { error: "دسته‌بندی دوره نامعتبر است" };
  if (body.comingSoon !== undefined && typeof body.comingSoon !== "boolean") return { error: "وضعیت انتشار دوره نامعتبر است" };
  if (values.price === 0 && body.isFree !== true && body.comingSoon !== true) return { error: "برای انتشار دوره، قیمت را وارد کنید یا دوره را رایگان انتخاب کنید" };
  return { values: { ...values, isFree: body.isFree === true, comingSoon: body.comingSoon === true, discountPercent: values.price === 0 ? 0 : values.discountPercent, ...(lessonResult.lessons ? { lessons: lessonResult.lessons } : {}) } };
}

async function authorized(permission: "view" | "create" | "delete" = "view") { return Boolean(await getAdminUser(permission)); }

async function ensureSeeded() {
  if (await Course.countDocuments() === 0) {
    await Course.insertMany(coursesData.map((course) => ({ ...course, legacyId: course.id })));
  }
  await ensureFixedCourses();
  return Course.find().sort({ legacyId: 1, createdAt: 1 }).lean();
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const courses = (await ensureSeeded()).map((course) => ({
    ...course,
    lessons: course.lessons ?? [],
    discountPercent: course.discountPercent || 0,
    discountedPrice: course.isFree ? 0 : Math.round(course.price * (1 - (course.discountPercent || 0) / 100)),
  }));
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان ایجاد دوره را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error || !result.values) return NextResponse.json({ error: result.error || "اطلاعات نامعتبر است" }, { status: 400 });
  await connectDB();
  const last = await Course.findOne().sort({ legacyId: -1 }).select("legacyId").lean();
  const course = await Course.create({ ...result.values, legacyId: (last?.legacyId || 0) + 1 });
  return NextResponse.json({ course: { ...course.toObject(), lessons: course.lessons ?? [], discountedPrice: course.isFree ? 0 : Math.round(course.price * (1 - (course.discountPercent || 0) / 100)) } }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as (Record<string, unknown> & { id?: unknown }) | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه دوره نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error || !result.values) return NextResponse.json({ error: result.error || "اطلاعات نامعتبر است" }, { status: 400 });
  await connectDB();
  const course = await Course.findByIdAndUpdate(body.id, result.values, { returnDocument: "after", runValidators: true }).lean();
  if (!course) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
  return NextResponse.json({ course: { ...course, lessons: course.lessons ?? [], discountedPrice: course.isFree ? 0 : Math.round(course.price * (1 - (course.discountPercent || 0) / 100)) } });
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف دوره را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه دوره نامعتبر است" }, { status: 400 });
  await connectDB();
  const course = await Course.findByIdAndDelete(body.id).lean();
  if (!course) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
  return NextResponse.json({ success: true });
}