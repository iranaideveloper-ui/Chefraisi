import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashResetCode, MAX_RESET_ATTEMPTS } from "@/lib/passwordReset";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { mobile?: unknown; code?: unknown } | null;
    const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!/^09\d{9}$/.test(mobile) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: "شماره موبایل یا کد تایید نامعتبر است" }, { status: 400 });
    }

    const rateLimitResponse = enforceRateLimit({
      key: `forgot-password:verify:${getClientIp(request)}:${mobile}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    await connectDB();
    const user = await User.findOne({ mobile });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt) {
      return NextResponse.json({ success: false, error: "کد تایید نامعتبر یا منقضی شده است" }, { status: 400 });
    }

    if (user.passwordResetAttempts >= MAX_RESET_ATTEMPTS || user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "کد تایید نامعتبر یا منقضی شده است" }, { status: 400 });
    }

    user.passwordResetAttempts += 1;
    const isValid = hashResetCode(code) === user.passwordResetCodeHash;
    await user.save();

    if (!isValid) {
      return NextResponse.json({ success: false, error: "کد تایید اشتباه است" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "کد تایید شد" });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}