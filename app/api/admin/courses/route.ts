import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import { coursesData } from "@/data/coursesData";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

const categories = ["cooking", "design", "management", "complete"] as const;
const fields = ["title", "description", "image", "price", "category", "discountPercent"] as const;

function validate(body: Record<string, unknown>) {
  const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]]));
  if (fields.some((field) => !values[field] && values[field] !== 0)) return { error: "تکمیل اطلاعات اصلی دوره الزامی است" };
  if (typeof values.price !== "number" || !Number.isFinite(values.price) || values.price < 0) return { error: "قیمت دوره نامعتبر است" };
  if (typeof values.discountPercent !== "number" || !Number.isInteger(values.discountPercent) || values.discountPercent < 0 || values.discountPercent > 99) return { error: "درصد تخفیف باید عددی بین ۰ تا ۹۹ باشد" };
  if (!categories.includes(values.category as (typeof categories)[number])) return { error: "دسته‌بندی دوره نامعتبر است" };
  return { values: { ...values, isFree: Boolean(body.isFree) || values.price === 0, discountPercent: values.price === 0 ? 0 : values.discountPercent } };
}

async function authorized(permission: "view" | "create" | "delete" = "view") { return Boolean(await getAdminUser(permission)); }

async function ensureSeeded() {
  if (await Course.countDocuments() === 0) {
    await Course.insertMany(coursesData.map((course) => ({ ...course, legacyId: course.id })));
  }
  return Course.find().sort({ legacyId: 1, createdAt: 1 }).lean();
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const courses = (await ensureSeeded()).map((course) => ({
    ...course,
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
  return NextResponse.json({ course: { ...course.toObject(), discountedPrice: course.isFree ? 0 : Math.round(course.price * (1 - (course.discountPercent || 0) / 100)) } }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as (Record<string, unknown> & { id?: unknown }) | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه دوره نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error || !result.values) return NextResponse.json({ error: result.error || "اطلاعات نامعتبر است" }, { status: 400 });
  await connectDB();
  const course = await Course.findByIdAndUpdate(body.id, result.values, { new: true, runValidators: true }).lean();
  if (!course) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
  return NextResponse.json({ course: { ...course, discountedPrice: course.isFree ? 0 : Math.round(course.price * (1 - (course.discountPercent || 0) / 100)) } });
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