import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getZarinpalConfig } from "@/lib/zarinpal";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  if (!authority || status !== "OK") return NextResponse.redirect(new URL("/user-panel/payments?status=cancelled", url));
  const gateway = getZarinpalConfig();
  if (!gateway.isConfigured || !gateway.merchantId) return NextResponse.redirect(new URL("/user-panel/payments?status=unavailable", url));
  await connectDB();
  const payment = await Payment.findOne({ paymentId: authority, status: "pending" }).lean();
  if (!payment) return NextResponse.redirect(new URL("/user-panel/payments?status=invalid", url));
  let response: Response;
  try {
    response = await fetch(gateway.verifyUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchant_id: gateway.merchantId, amount: payment.amount * 10, authority }) });
  } catch {
    await Payment.updateOne({ _id: payment._id }, { $set: { status: "failed" } });
    return NextResponse.redirect(new URL("/user-panel/payments?status=failed", url));
  }
  const result = await response.json().catch(() => null) as { data?: { code?: number; ref_id?: number } } | null;
  if (!response.ok || !result?.data || ![100, 101].includes(result.data.code || 0)) {
    await Payment.updateOne({ _id: payment._id }, { $set: { status: "failed" } });
    return NextResponse.redirect(new URL("/user-panel/payments?status=failed", url));
  }
  await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } });
  await Order.updateOne({ orderId: payment.orderId, status: "pending" }, { $set: { status: "paid" } });
  return NextResponse.redirect(new URL(`/user-panel/payments?status=success&order=${payment.orderId}`, url));
}