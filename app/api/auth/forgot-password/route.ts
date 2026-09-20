import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  createResetCode,
  hashResetCode,
  RESET_CODE_COOLDOWN_MS,
  RESET_CODE_TTL_MS,
  sendResetCode,
} from "@/lib/passwordReset";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const genericResponse = {
  success: true,
  message: "اگر این شماره ثبت شده باشد، کد تایید برای آن ارسال می‌شود.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { mobile?: unknown } | null;
    const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";

    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipLimit = checkRateLimit({ key: `forgot-password:ip:${ip}`, limit: 3, windowMs: 10 * 60 * 1000 });
    const phoneLimit = checkRateLimit({ key: `forgot-password:phone:${mobile}`, limit: 3, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed || !phoneLimit.allowed) {
      return rateLimitResponse(Math.max(ipLimit.retryAfter, phoneLimit.retryAfter));
    }

    await connectDB();
    const user = await User.findOne({ mobile });
    if (!user) return NextResponse.json(genericResponse);

    const now = Date.now();
    if (user.passwordResetCodeSentAt && now - user.passwordResetCodeSentAt.getTime() < RESET_CODE_COOLDOWN_MS) {
      return NextResponse.json(genericResponse);
    }

    const code = createResetCode();
    user.passwordResetCodeHash = hashResetCode(code);
    user.passwordResetCodeExpiresAt = new Date(now + RESET_CODE_TTL_MS);
    user.passwordResetCodeSentAt = new Date(now);
    user.passwordResetAttempts = 0;

    try {
      await sendResetCode(mobile, code);
      await user.save();
    } catch (error) {
      console.error("Password reset SMS delivery failed:", error instanceof Error ? error.message : error);
      user.passwordResetCodeHash = null;
      user.passwordResetCodeExpiresAt = null;
      user.passwordResetCodeSentAt = null;
      user.passwordResetAttempts = 0;
      await user.save();
      return NextResponse.json({ success: false, error: "ارسال کد تایید انجام نشد. لطفا دوباره تلاش کنید." }, { status: 503 });
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Password reset request failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}