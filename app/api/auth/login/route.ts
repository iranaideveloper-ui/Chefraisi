import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rateLimitResponse = enforceRateLimit({
      key: `login:ip:${getClientIp(req)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { mobile, password, rememberMe, panelType = "user" } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    if (panelType !== "user" && panelType !== "admin") {
      return NextResponse.json({ success: false, error: "نوع پنل نامعتبر است" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ mobile });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    if (panelType === "admin" && user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "شما دسترسی ورود به پنل ادمین را ندارید" }, { status: 403 });
    }

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: maxAge }
    );

    const res = NextResponse.json({
      success: true,
      message: `خوش آمدی ${user.firstName} جان!`,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطای سرور: " + String(error) },
      { status: 500 }
    );
  }
}
