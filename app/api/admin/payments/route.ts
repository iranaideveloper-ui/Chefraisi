import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getSuperAdminUser } from "@/lib/sessionUser";
import { getZarinpalConfig } from "@/lib/zarinpal";

export async function GET() {
  const user = await getSuperAdminUser();
  if (!user) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const payments = await Payment.find({
    status: "success",
    amount: { $gt: 0 },
    paymentId: { $not: /^PAY-/ },
  }).sort({ createdAt: -1 }).lean();
  const total = user.role === "super_admin" ? payments.reduce((sum, payment) => sum + payment.amount, 0) : undefined;
  const gateway = getZarinpalConfig();
  return NextResponse.json({
    payments,
    successfulCount: payments.length,
    total,
    gateway: {
      isConfigured: gateway.isConfigured,
      isSandbox: gateway.isSandbox,
      callbackUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    },
  });
}
