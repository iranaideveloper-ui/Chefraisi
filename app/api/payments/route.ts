import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getSessionUser } from "@/lib/sessionUser";
import { getZarinpalConfig } from "@/lib/zarinpal";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });
  await connectDB();
  const gateway = getZarinpalConfig();
  const payments = await Payment.find({
    userId: user._id,
    status: "success",
    $or: [
      { amount: 0 },
      ...(gateway.isConfigured ? [{ amount: { $gt: 0 }, paymentId: { $not: /^PAY-/ } }] : []),
    ],
  }).sort({ createdAt: -1 }).lean();
  const normalizedPayments = payments.map((payment) => ({ ...payment, id: String(payment._id) }));
  return NextResponse.json({ payments: normalizedPayments });
}
