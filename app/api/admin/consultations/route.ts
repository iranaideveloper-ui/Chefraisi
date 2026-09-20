import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Consultation from "@/models/Consultation";
import Project from "@/models/Project";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

export async function GET(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const status = new URL(request.url).searchParams.get("status");
  const referredProjectIds = status === "referred" ? (await Project.find({ sourceConsultationId: { $exists: true, $ne: null } }).distinct("sourceConsultationId")) : [];
  const filter = status === "referred" ? { status, _id: { $nin: referredProjectIds } } : status ? { status } : {};
  const consultations = await Consultation.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ consultations }, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}

export async function PATCH(request: Request) {
  if (!await getAdminUser("create")) return NextResponse.json({ error: "مجوز ایجاد یا ویرایش ندارید" }, { status: 403 });
  const { id, status } = await request.json();
  if (!id || !["pending", "reviewed", "referred"].includes(status)) return NextResponse.json({ error: "داده نامعتبر است" }, { status: 400 });
  await connectDB();
  const consultation = await Consultation.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!consultation) return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  return NextResponse.json({ consultation });
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف درخواست را دارد" }, { status: 403 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "شناسه درخواست الزامی است" }, { status: 400 });
  await connectDB();
  const consultation = await Consultation.findByIdAndDelete(id).lean();
  if (!consultation) return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  return NextResponse.json({ success: true });
}
