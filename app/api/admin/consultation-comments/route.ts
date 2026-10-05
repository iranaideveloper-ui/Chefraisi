import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import AdminInboxComment from "@/models/AdminInboxComment";
import Consultation from "@/models/Consultation";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

const maxCommentLength = 2000;

export async function GET() {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد به صندوق یادداشت‌ها دسترسی دارد" }, { status: 403 });
  await connectDB();
  const comments = await AdminInboxComment.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ comments: comments.map((comment) => ({ ...comment, _id: String(comment._id) })) });
}

export async function POST(request: Request) {
  const admin = await getAdminUser("create");
  if (!admin) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as { consultationId?: unknown; comment?: unknown } | null;
  if (!body || typeof body.consultationId !== "string" || !mongoose.isValidObjectId(body.consultationId)) {
    return NextResponse.json({ error: "شناسه درخواست مشاوره نامعتبر است" }, { status: 400 });
  }
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!comment) return NextResponse.json({ error: "متن یادداشت را وارد کنید" }, { status: 400 });
  if (comment.length > maxCommentLength) return NextResponse.json({ error: `یادداشت نمی‌تواند بیشتر از ${maxCommentLength} کاراکتر باشد` }, { status: 400 });

  await connectDB();
  const consultation = await Consultation.findById(body.consultationId).select("name family phone consultationType").lean();
  if (!consultation) return NextResponse.json({ error: "درخواست مشاوره یافت نشد" }, { status: 404 });
  const authorName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.mobile || "مدیر";
  const savedComment = await AdminInboxComment.create({
    consultationId: consultation._id,
    consultationName: `${consultation.name} ${consultation.family}`.trim(),
    consultationPhone: consultation.phone,
    consultationType: consultation.consultationType,
    authorId: admin._id,
    authorName,
    authorRole: admin.role,
    comment,
  });
  return NextResponse.json({ comment: { ...savedComment.toObject(), _id: String(savedComment._id) } }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف یادداشت را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) {
    return NextResponse.json({ error: "شناسه یادداشت نامعتبر است" }, { status: 400 });
  }
  await connectDB();
  const deletedComment = await AdminInboxComment.findByIdAndDelete(body.id).lean();
  if (!deletedComment) return NextResponse.json({ error: "یادداشت یافت نشد" }, { status: 404 });
  return NextResponse.json({ success: true });
}