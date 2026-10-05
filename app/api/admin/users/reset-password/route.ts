import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUser } from "@/lib/sessionUser";
import { sendTemporaryPassword } from "@/lib/passwordReset";

function createTemporaryPassword() {
  return String(randomInt(10000000, 100000000));
}

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "super_admin") return NextResponse.json({ error: "فقط مدیر ارشد امکان ریست رمز را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "شناسه کاربر نامعتبر است" }, { status: 400 });

  await connectDB();
  const user = await User.findById(body.id).select("mobile");
  if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  const temporaryPassword = createTemporaryPassword();
  try {
    await sendTemporaryPassword(user.mobile, temporaryPassword);
  } catch (error) {
    console.error("Admin password reset SMS delivery failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "پیامک ارسال نشد؛ رمز عبور تغییر نکرد. تنظیمات ملی‌پیامک را بررسی کنید." }, { status: 503 });
  }

  user.password = await bcrypt.hash(temporaryPassword, 12);
  await user.save();
  return NextResponse.json({ success: true, smsSent: true, message: "رمز جدید به شماره همراه کاربر ارسال شد" });
}
