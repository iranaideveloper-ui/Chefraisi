import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getAdminUser } from "@/lib/sessionUser";
import { getFirstSixCourses } from "@/data/coursesData";
import Course from "@/models/Course";

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const orders = await Order.find({ status: "paid" }).sort({ createdAt: -1 }).lean();
  const storedCourses = await Course.find().select("legacyId title").lean();
  const users = await User.find({ mobile: { $in: orders.map((order) => order.userMobile) } }).select("firstName lastName mobile").lean();
  const byMobile = new Map(users.map((user) => [user.mobile, user]));
  const courseNames = new Map([...getFirstSixCourses().map((course) => [course.id, course.title] as const), ...storedCourses.filter((course) => typeof course.legacyId === "number").map((course) => [course.legacyId as number, course.title] as const)]);
  const isCorruptText = (value: unknown) => typeof value !== "string" || /^\?+$/.test(value.trim());
  return NextResponse.json({ orders: orders.map((order) => ({ id: order.orderId, customer: { id: String(order.userId), name: `${byMobile.get(order.userMobile)?.firstName || ""} ${byMobile.get(order.userMobile)?.lastName || ""}`.trim() || order.userMobile }, status: order.status === "paid" ? "active" : order.status === "cancelled" ? "cancelled" : "closed", total: order.total, createdAt: order.createdAt, items: order.items.map((item: { id?: number; name?: string; count?: number; price?: number }) => ({ id: item.id, name: courseNames.get(item.id || 0) || (isCorruptText(item.name) ? "دوره ثبت‌نام‌شده" : item.name), qty: item.count || 0, price: item.price || 0 })) })) }, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
