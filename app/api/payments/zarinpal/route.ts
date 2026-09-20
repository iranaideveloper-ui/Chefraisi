import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getSessionUser } from "@/lib/sessionUser";
import { getPaymentCallbackUrl, getZarinpalConfig } from "@/lib/zarinpal";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "برای پرداخت وارد حساب شوید" }, { status: 401 });
  const body = await request.json().catch(() => null) as { orderId?: unknown } | null;
  if (!body || typeof body.orderId !== "string") return NextResponse.json({ error: "سفارش نامعتبر است" }, { status: 400 });
  const gateway = getZarinpalConfig();
  if (!gateway.isConfigured || !gateway.merchantId) return NextResponse.json({ error: "درگاه زرین‌پال هنوز فعال نشده است؛ پس از ثبت Merchant ID امکان پرداخت فراهم می‌شود." }, { status: 503 });
  await connectDB();
  const order = await Order.findOne({ orderId: body.orderId, userId: user._id, status: "pending" }).lean();
  if (!order || order.total <= 0) return NextResponse.json({ error: "سفارش قابل پرداخت نیست" }, { status: 400 });
  let response: Response;
  try {
    response = await fetch(gateway.requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_id: gateway.merchantId, amount: order.total * 10, description: `پرداخت سفارش ${order.orderId}`, callback_url: getPaymentCallbackUrl(request.url), metadata: { mobile: user.mobile } }),
    });
  } catch {
    return NextResponse.json({ error: "ارتباط با درگاه زرین‌پال برقرار نشد" }, { status: 502 });
  }
  const result = await response.json().catch(() => null) as { data?: { authority?: string; code?: number }; errors?: unknown } | null;
  if (!response.ok || !result?.data?.authority || result.data.code !== 100) return NextResponse.json({ error: "دریافت درگاه پرداخت زرین‌پال انجام نشد" }, { status: 502 });
  await Payment.findOneAndUpdate({ orderId: order.orderId, userId: user._id }, { $set: { paymentId: result.data.authority } });
  return NextResponse.json({ url: `${gateway.startPayUrl}/${result.data.authority}` });
}