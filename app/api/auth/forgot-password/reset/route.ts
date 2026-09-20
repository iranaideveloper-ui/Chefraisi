import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashResetCode, MAX_RESET_ATTEMPTS } from "@/lib/passwordReset";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { mobile?: unknown; code?: unknown; password?: unknown } | null;
    const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^09\d{9}$/.test(mobile) || !/^\d{6}$/.test(code) || password.length < 8) {
      return NextResponse.json({ success: false, error: "اطلاعات واردشده معتبر نیست؛ رمز باید حداقل ۸ کاراکتر باشد" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ mobile });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt || user.passwordResetAttempts >= MAX_RESET_ATTEMPTS || user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "کد تایید نامعتبر یا منقضی شده است" }, { status: 400 });
    }

    if (hashResetCode(code) !== user.passwordResetCodeHash) {
      user.passwordResetAttempts += 1;
      await user.save();
      return NextResponse.json({ success: false, error: "کد تایید نامعتبر است" }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordResetCodeSentAt = null;
    user.passwordResetAttempts = 0;
    await user.save();

    const maxAge = 24 * 60 * 60;
    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET!, { expiresIn: maxAge });
    const response = NextResponse.json({ success: true, message: "رمز عبور با موفقیت تغییر کرد" });
    response.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}