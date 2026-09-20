import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { departmentsData } from "@/data/teamData";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

const fields = ["title", "tagline", "image"] as const;
function validate(body: Record<string, unknown>) {
  const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]]));
  if (fields.some((field) => !values[field])) return { error: "تکمیل همه فیلدهای عضو تیم الزامی است" };
  const services = Array.isArray(body.services) ? body.services.filter((service): service is string => typeof service === "string" && Boolean(service.trim())).map((service) => service.trim()) : [];
  if (services.length > 3) return { error: "حداکثر سه خدمت برای هر دپارتمان مجاز است" };
  return { values: { ...values, services } };
}
async function ensureSeeded() {
  const first = await TeamMember.findOne().lean();
  if (!first || !first.title) {
    await TeamMember.deleteMany({});
    await TeamMember.insertMany(departmentsData.map((department) => ({ ...department, legacyId: department.id })));
  }
  return TeamMember.find().sort({ legacyId: 1, createdAt: 1 }).lean();
}
async function authorized(permission: "view" | "create" | "delete" = "view") { return Boolean(await getAdminUser(permission)); }

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  return NextResponse.json({ members: await ensureSeeded() });
}

export async function POST(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان ایجاد دپارتمان را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  if (!result.values) return NextResponse.json({ error: "اطلاعات عضو تیم نامعتبر است" }, { status: 400 });
  await connectDB();
  const member = await TeamMember.create(result.values);
  return NextResponse.json({ member }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as (Record<string, unknown> & { id?: unknown }) | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه عضو نامعتبر است" }, { status: 400 });
  const result = validate(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  if (!result.values) return NextResponse.json({ error: "اطلاعات عضو تیم نامعتبر است" }, { status: 400 });
  await connectDB();
  const member = await TeamMember.findByIdAndUpdate(body.id, result.values, { new: true, runValidators: true }).lean();
  if (!member) return NextResponse.json({ error: "عضو تیم یافت نشد" }, { status: 404 });
  return NextResponse.json({ member });
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف دپارتمان را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه عضو نامعتبر است" }, { status: 400 });
  await connectDB();
  const member = await TeamMember.findByIdAndDelete(body.id).lean();
  if (!member) return NextResponse.json({ error: "عضو تیم یافت نشد" }, { status: 404 });
  return NextResponse.json({ success: true });
}
