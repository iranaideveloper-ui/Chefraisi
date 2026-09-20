import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, mobile, password, address } = await req.json();

    if (!firstName || !lastName || !mobile || !password) {
      return NextResponse.json(
        { success: false, error: "لطفاً همه فیلدهای الزامی را پر کنید" },
        { status: 400 }
      );
    }
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    await connectDB();
    if (await User.findOne({ mobile })) {
      return NextResponse.json(
        { success: false, error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    await User.create({
      firstName,
      lastName,
      mobile,
      password: await bcrypt.hash(password, 10),
      address: address || "",
    });

    return NextResponse.json(
      { success: true, message: "ثبت‌نام با موفقیت انجام شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: "خطای سرور، دوباره تلاش کنید" }, { status: 500 });
  }
}
