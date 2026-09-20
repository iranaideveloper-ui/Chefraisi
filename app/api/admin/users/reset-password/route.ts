import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUser } from "@/lib/sessionUser";

function createTemporaryPassword() {
  return String(randomInt(10000000, 100000000));
}

async function sendPasswordSms(mobile: string, password: string) {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  if (!apiUrl || !apiKey) return false;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ mobile, message: `رمز عبور جدید شما: ${password}` }),
  });
  return response.ok;
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
  user.password = await bcrypt.hash(temporaryPassword, 12);
  await user.save();

  try {
    const smsSent = await sendPasswordSms(user.mobile, temporaryPassword);
    return NextResponse.json({ success: true, smsSent, message: smsSent ? "رمز جدید به شماره همراه کاربر ارسال شد" : "رمز تغییر کرد؛ تنظیمات سرویس پیامک کامل نشده است" });
  } catch {
    return NextResponse.json({ success: true, smsSent: false, message: "رمز تغییر کرد اما ارسال پیامک ناموفق بود" });
  }
}
