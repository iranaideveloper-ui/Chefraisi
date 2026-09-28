import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Article from "@/models/Article";
import { isDuplicateKeyError, validateArticleInput } from "@/lib/articleValidation";
import { getAdminUser } from "@/lib/sessionUser";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  if (!await getAdminUser("create")) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "شناسه مقاله نامعتبر است" }, { status: 400 });
  const body: unknown = await request.json().catch(() => null);
  const validation = validateArticleInput(body);
  if (validation.error || !validation.data) {
    return NextResponse.json({ error: validation.error || "اطلاعات مقاله نامعتبر است" }, { status: 400 });
  }

  try {
    await connectDB();
    const article = await Article.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true }).lean();
    if (!article) return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
    return NextResponse.json({ article: { ...article, _id: String(article._id) } });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: "نشانی مقاله تکراری است" }, { status: 409 });
    }
    return NextResponse.json({ error: "ویرایش مقاله انجام نشد" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!await getAdminUser("delete")) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "شناسه مقاله نامعتبر است" }, { status: 400 });
  try {
    await connectDB();
    const article = await Article.findByIdAndDelete(id).lean();
    if (!article) return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حذف مقاله انجام نشد" }, { status: 500 });
  }
}