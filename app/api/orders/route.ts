import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getSessionUser } from "@/lib/sessionUser";
import { getPublicCourses } from "@/lib/getCourses";
import { getZarinpalConfig } from "@/lib/zarinpal";

type SubmittedItem = { id?: unknown; count?: unknown };

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });
  await connectDB();
  const orders = await Order.find({ userId: user._id, status: "paid" }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "برای خرید وارد حساب شوید" }, { status: 401 });
  const body = await request.json().catch(() => null) as { items?: SubmittedItem[] } | null;
  if (!body || !Array.isArray(body.items) || !body.items.length) return NextResponse.json({ error: "سبد خرید نامعتبر است" }, { status: 400 });

  const availableCourses = new Map((await getPublicCourses()).slice(0, 6).map((course) => [course.id, course]));
  const items = body.items.map((submittedItem) => {
    const courseId = Number(submittedItem.id);
    const count = Number(submittedItem.count);
    const course = availableCourses.get(courseId);
    if (!course || !Number.isInteger(count) || count < 1 || count > 99) return null;
    const price = course.isFree ? 0 : course.discountedPrice;
    return { id: course.id, name: course.title, price, count };
  });
  if (items.some((item) => item === null)) return NextResponse.json({ error: "یک یا چند دوره معتبر نیستند" }, { status: 400 });
  const validItems = items as Array<{ id: number; name: string; price: number; count: number }>;
  const total = validItems.reduce((sum, item) => sum + item.price * item.count, 0);
  if (total > 0 && !getZarinpalConfig().isConfigured) {
    return NextResponse.json({ error: "درگاه زرین‌پال هنوز فعال نشده است؛ پس از ثبت Merchant ID امکان پرداخت فراهم می‌شود." }, { status: 503 });
  }
  await connectDB();
  const orderId = `ORD-${Date.now()}`;
  const paymentId = `PAY-${Date.now()}`;
  const order = await Order.create({ orderId, userId: user._id, userMobile: user.mobile, items: validItems, total, status: total === 0 ? "paid" : "pending" });
  await Payment.create({ paymentId, orderId, userId: user._id, userMobile: user.mobile, items: validItems, amount: total, status: total === 0 ? "success" : "pending" });
  if (total === 0) return NextResponse.json({ order, paymentId, free: true }, { status: 201 });
  return NextResponse.json({ order, paymentId, requiresPayment: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });
  const body = await request.json().catch(() => null) as { orderId?: unknown; courseId?: unknown } | null;
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
  const courseId = Number(body?.courseId);
  if (!orderId || !Number.isInteger(courseId)) return NextResponse.json({ error: "اطلاعات حذف دوره نامعتبر است" }, { status: 400 });
  await connectDB();
  const order = await Order.findOne({ orderId, userId: user._id, status: "paid" });
  if (!order) return NextResponse.json({ error: "ثبت‌نام دوره یافت نشد" }, { status: 404 });
  type OrderItem = { id: number; name: string; price: number; count: number };
  const orderItems = order.items as OrderItem[];
  const hasCourse = orderItems.some((item: OrderItem) => item.id === courseId);
  if (!hasCourse) return NextResponse.json({ error: "این دوره در سفارش شما وجود ندارد" }, { status: 404 });
  const remainingItems = orderItems.filter((item: OrderItem) => item.id !== courseId);
  order.items = remainingItems as typeof order.items;
  if (remainingItems.length === 0) {
    await Order.deleteOne({ _id: order._id });
  } else {
    order.total = remainingItems.reduce((sum: number, item: OrderItem) => sum + item.price * item.count, 0);
    await order.save();
  }
  return NextResponse.json({ success: true });
}
