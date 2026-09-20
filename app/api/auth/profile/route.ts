import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

type TokenPayload = { userId: string };

async function getAuthenticatedUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    await connectDB();
    return User.findById(payload.userId).select("firstName lastName mobile address phone avatar role");
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "احراز هویت انجام نشده است" }, { status: 401 });
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "احراز هویت انجام نشده است" }, { status: 401 });

  const body = await request.json();
  const updates = {
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    address: String(body.address || "").trim(),
    phone: String(body.phone || "").trim(),
    avatar: String(body.avatar || "").trim(),
  };

  if (!updates.firstName || !updates.lastName) {
    return NextResponse.json({ error: "نام و نام خانوادگی الزامی است" }, { status: 400 });
  }

  Object.assign(user, updates);
  await user.save();
  return NextResponse.json(user);
}
