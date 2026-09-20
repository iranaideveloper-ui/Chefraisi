import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/sessionUser";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const admin = await getSessionUser();
  if (!admin || (admin.role !== "admin" && admin.role !== "super_admin")) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const users = await User.find().select("firstName lastName mobile phone role address avatar createdAt permissions").sort({ role: 1, createdAt: -1 }).lean();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "super_admin") return NextResponse.json({ error: "فقط مدیر ارشد امکان ایجاد ادمین را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { firstName?: unknown; lastName?: unknown; mobile?: unknown; password?: unknown } | null;
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const mobile = String(body?.mobile || "").trim();
  const password = String(body?.password || "");
  if (!firstName || !lastName || !/^09\d{9}$/.test(mobile) || password.length < 6) return NextResponse.json({ error: "نام، نام خانوادگی، شماره موبایل معتبر و رمز حداقل ۶ کاراکتری الزامی است" }, { status: 400 });
  await connectDB();
  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount >= 2) return NextResponse.json({ error: "حداکثر دو مدیر عادی می‌توان ایجاد کرد" }, { status: 409 });
  const exists = await User.exists({ mobile });
  if (exists) return NextResponse.json({ error: "این شماره موبایل قبلاً ثبت شده است" }, { status: 409 });
  const bcrypt = await import("bcryptjs");
  const user = await User.create({ firstName, lastName, mobile, password: await bcrypt.hash(password, 12), role: "admin", permissions: { view: true, create: false, delete: false } });
  return NextResponse.json({ user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, mobile: user.mobile, role: user.role, permissions: user.permissions } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "super_admin") return NextResponse.json({ error: "فقط مدیر ارشد امکان تغییر کاربران را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown; role?: unknown; permissions?: { view?: unknown; create?: unknown; delete?: unknown } } | null;
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "شناسه کاربر نامعتبر است" }, { status: 400 });
  await connectDB();
  const target = await User.findById(body.id).select("role permissions");
  if (!target) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  if (target.role === "super_admin") return NextResponse.json({ error: "تغییر نقش مدیر ارشد مجاز نیست" }, { status: 403 });
  if (body.role !== undefined) {
    if (!["user", "admin"].includes(String(body.role))) return NextResponse.json({ error: "نقش نامعتبر است" }, { status: 400 });
    target.role = body.role as "user" | "admin";
  }
  if (body.permissions) target.permissions = { view: Boolean(body.permissions.view), create: Boolean(body.permissions.create), delete: Boolean(body.permissions.delete) };
  await target.save();
  return NextResponse.json({ user: target });
}

export async function DELETE(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "super_admin") return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف کاربر را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "شناسه کاربر نامعتبر است" }, { status: 400 });
  await connectDB();
  const target = await User.findById(body.id).select("role");
  if (!target) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  if (target.role === "super_admin") return NextResponse.json({ error: "حذف مدیر ارشد مجاز نیست" }, { status: 403 });
  await User.findByIdAndDelete(body.id);
  return NextResponse.json({ success: true });
}
