import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

export async function PATCH(req: Request, context: unknown) {
  // Next.js may provide params as a plain object or a Promise - handle both.
  const params = (context as { params?: unknown })?.params;
  let id: string | undefined;
  if (params && typeof (params as Promise<unknown>).then === "function") {
    const p = await (params as Promise<{ id: string }>);
    id = p.id;
  } else {
    id = (params as { id: string } | undefined)?.id;
  }
  // ensure id is defined for subsequent logic
  id = id ?? "";
  try {
    if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const body = await req.json();
    const { action, toWallet } = body as { action?: string; toWallet?: boolean };

    if (!action) {
      return NextResponse.json({ error: "action missing" }, { status: 400 });
    }

    // Simulate different outcomes
    if (action === "cancel") {
      await connectDB();
      await Order.findOneAndUpdate({ orderId: id }, { status: "cancelled" });
      return NextResponse.json({ message: `سفارش ${id} با موفقیت لغو شد.` });
    }

    if (action === "transfer") {
      return NextResponse.json({ message: `مبلغ سفارش ${id} به کیف‌پول مشتری منتقل شد.` });
    }

    if (action === "refund") {
      if (toWallet) {
        return NextResponse.json({ message: `مبلغ سفارش ${id} به کیف‌پول مشتری عودت شد.` });
      }
      return NextResponse.json({ message: `مبلغ سفارش ${id} به مشتری عودت داده شد.` });
    }

    return NextResponse.json({ message: `عملیات ${action} روی سفارش ${id} انجام شد.` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: unknown) {
  const admin = await getSuperAdminUser();
  if (!admin) return NextResponse.json({ error: "مجوز حذف ثبت‌نام را ندارید" }, { status: 403 });
  const params = (context as { params?: unknown })?.params;
  const resolved = params && typeof (params as Promise<unknown>).then === "function" ? await (params as Promise<{ id: string }>) : params as { id?: string } | undefined;
  const orderId = resolved?.id || "";
  const body = await req.json().catch(() => null) as { courseId?: unknown } | null;
  const courseId = Number(body?.courseId);
  if (!orderId || !Number.isInteger(courseId)) return NextResponse.json({ error: "اطلاعات حذف ثبت‌نام نامعتبر است" }, { status: 400 });
  await connectDB();
  const order = await Order.findOne({ orderId, status: "paid" });
  if (!order) return NextResponse.json({ error: "ثبت‌نام نهایی این دوره یافت نشد؛ فقط سفارش‌های پرداخت‌شده قابل حذف هستند" }, { status: 404 });
  const items = order.items as Array<{ id: number; name: string; price: number; count: number }>;
  const remaining = items.filter((item) => item.id !== courseId);
  if (remaining.length === items.length) return NextResponse.json({ error: "دوره در این سفارش یافت نشد" }, { status: 404 });
  if (!remaining.length) await Order.deleteOne({ _id: order._id });
  else { order.items = remaining as typeof order.items; order.total = remaining.reduce((sum, item) => sum + item.price * item.count, 0); await order.save(); }
  return NextResponse.json({ success: true });
}
