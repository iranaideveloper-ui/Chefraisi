import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Launch from "@/models/Launch";
import { projectsData } from "@/data/projectsData";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";
import Project from "@/models/Project";

const fields = ["restaurantName", "location", "cuisine", "launchYear", "image"] as const;
function validate(body: Record<string, unknown>) {
  const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]]));
  if (fields.some((field) => !values[field])) return { error: "تکمیل اطلاعات اصلی راه‌اندازی الزامی است" };
  if (typeof values.launchYear !== "number" || !Number.isInteger(values.launchYear) || values.launchYear < 1300 || values.launchYear > 1600) return { error: "سال راه‌اندازی نامعتبر است" };
  const servicesProvided = Array.isArray(body.servicesProvided) ? body.servicesProvided.filter((service): service is string => typeof service === "string" && Boolean(service.trim())).map((service) => service.trim()) : [];
  return { values: { ...values, servicesProvided } };
}
async function authorized(permission: "view" | "create" | "delete" = "view") { return Boolean(await getAdminUser(permission)); }
async function ensureSeeded() {
  if (await Launch.countDocuments() === 0) await Launch.insertMany(projectsData.map((project) => ({ ...project, legacyId: project.id })));
  return Launch.find().sort({ legacyId: 1, createdAt: 1 }).lean();
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const launches = await ensureSeeded();
  const referred = launches.filter((launch) => Boolean(launch.sourceProjectId));
  return NextResponse.json({ launches, referredLaunches: referred, projects: await Project.find({ _id: { $in: referred.map((launch) => launch.sourceProjectId) } }).lean() });
}

export async function POST(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان ایجاد راه‌اندازی را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error || !result.values) return NextResponse.json({ error: result.error || "اطلاعات نامعتبر است" }, { status: 400 });
  await connectDB();
  const launch = await Launch.create(result.values);
  return NextResponse.json({ launch }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as (Record<string, unknown> & { id?: unknown }) | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه راه‌اندازی نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error || !result.values) return NextResponse.json({ error: result.error || "اطلاعات نامعتبر است" }, { status: 400 });
  await connectDB();
  const launch = await Launch.findByIdAndUpdate(body.id, result.values, { new: true, runValidators: true }).lean();
  if (!launch) return NextResponse.json({ error: "راه‌اندازی یافت نشد" }, { status: 404 });
  return NextResponse.json({ launch });
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف راه‌اندازی را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه راه‌اندازی نامعتبر است" }, { status: 400 });
  await connectDB();
  const launch = await Launch.findByIdAndDelete(body.id).lean();
  if (!launch) return NextResponse.json({ error: "راه‌اندازی یافت نشد" }, { status: 404 });
  return NextResponse.json({ success: true });
}
