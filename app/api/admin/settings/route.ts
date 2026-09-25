import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import User from "@/models/User";
import { defaultSiteSettings } from "@/lib/siteSettings";
import { getSessionUser } from "@/lib/sessionUser";

const requiredFields = ["phone", "email", "address", "whatsapp", "instagram", "bale"] as const;
const optionalFields = ["instagramUrl", "baleUrl", "mapUrl", "mapEmbedUrl", "baladUrl", "neshanUrl", "catalogPdfUrl"] as const;

async function authorized() {
  const user = await getSessionUser();
  return user?.role === "super_admin" ? user : null;
}

export async function GET() {
  const admin = await authorized();
  if (!admin) return NextResponse.json({ error: "فقط مدیر ارشد اجازه مدیریت تنظیمات را دارد" }, { status: 403 });
  await connectDB();
  const settings = await SiteSettings.findOne({ key: "site" }).lean();
  const user = await User.findById(admin._id).select("firstName lastName mobile").lean();
  return NextResponse.json({ settings: { ...defaultSiteSettings, ...(settings ?? {}) }, admin: user });
}

export async function PUT(request: Request) {
  const admin = await authorized();
  if (!admin) return NextResponse.json({ error: "فقط مدیر ارشد اجازه مدیریت تنظیمات را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "داده ارسالی نامعتبر است" }, { status: 400 });
  const values = Object.fromEntries(requiredFields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : ""]));
  const optionalValues = Object.fromEntries(optionalFields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : ""]));
  if (requiredFields.some((field) => !values[field])) return NextResponse.json({ error: "تکمیل اطلاعات سایت الزامی است" }, { status: 400 });
  if (!String(values.email).includes("@")) return NextResponse.json({ error: "ایمیل نامعتبر است" }, { status: 400 });
  const adminUpdates: { firstName: string; lastName: string; mobile: string; password?: string } = { firstName: String(body.adminFirstName).trim(), lastName: String(body.adminLastName).trim(), mobile: String(body.adminMobile).trim() };
  if (!adminUpdates.firstName || !adminUpdates.lastName || !/^09\d{9}$/.test(adminUpdates.mobile)) return NextResponse.json({ error: "اطلاعات مدیر ارشد نامعتبر است" }, { status: 400 });
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword && newPassword.length < 6) return NextResponse.json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }, { status: 400 });
  await connectDB();
  const settings = await SiteSettings.findOneAndUpdate({ key: "site" }, { $set: { ...values, ...optionalValues, key: "site" } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
  if (newPassword) adminUpdates.password = await bcrypt.hash(newPassword, 10);
  try {
    const updatedAdmin = await User.findOneAndUpdate({ role: "super_admin", _id: admin._id }, { $set: adminUpdates }, { new: true, runValidators: true }).select("firstName lastName mobile").lean();
    if (!updatedAdmin) return NextResponse.json({ error: "مدیر ارشد یافت نشد" }, { status: 404 });
    return NextResponse.json({ settings, admin: updatedAdmin });
  } catch (error) {
    if (error instanceof Error && error.name === "MongoServerError") return NextResponse.json({ error: "این شماره همراه قبلاً استفاده شده است" }, { status: 409 });
    throw error;
  }
}