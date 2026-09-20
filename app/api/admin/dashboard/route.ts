import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Consultation from "@/models/Consultation";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Project from "@/models/Project";
import Course from "@/models/Course";
import { coursesData } from "@/data/coursesData";
import { getAdminUser } from "@/lib/sessionUser";

async function ensureCoursesSeeded() {
  if (await Course.countDocuments() === 0) {
    await Course.insertMany(coursesData.map((course) => ({ ...course, legacyId: course.id })));
  }
  return Course.countDocuments();
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const [users, consultations, pendingConsultations, orders, payments, recentConsultations, consultationActivity, registrationTotal, launches, courses] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Consultation.countDocuments(),
    Consultation.countDocuments({ status: "pending" }),
    Order.find({ status: "paid" }).sort({ createdAt: -1 }).limit(5).lean(),
    Payment.find({ status: "success", createdAt: { $gte: monthStart } }).sort({ createdAt: -1 }).lean(),
    Consultation.find().sort({ createdAt: -1 }).limit(5).lean(),
    Consultation.find({ createdAt: { $gte: weekStart } }).select("createdAt").lean(),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$items.count", 0] } } } },
    ]),
    Project.countDocuments(),
    ensureCoursesSeeded(),
  ]);

  const registrations = Number(registrationTotal[0]?.total || 0);
  const consultationSeries = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(day); end.setHours(23, 59, 59, 999);
    return { label: new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(day), sales: consultationActivity.filter((item) => item.createdAt >= start && item.createdAt <= end).length };
  });

  return NextResponse.json({
    stats: { users, consultations, pendingConsultations, registrations, launches, courses, successfulPayments: payments.length },
    consultationSeries,
    recentConsultations,
    recentOrders: orders,
  });
}
