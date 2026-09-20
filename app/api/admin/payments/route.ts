import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getAdminUser } from "@/lib/sessionUser";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const payments = await Payment.find({ status: "success" }).sort({ createdAt: -1 }).lean();
  const total = user.role === "super_admin" ? payments.reduce((sum, payment) => sum + payment.amount, 0) : undefined;
  return NextResponse.json({ payments, successfulCount: payments.length, total });
}
