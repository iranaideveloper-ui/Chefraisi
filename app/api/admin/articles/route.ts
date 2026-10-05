import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Article from "@/models/Article";
import { createArticleSlug, isDuplicateKeyError, validateArticleInput } from "@/lib/articleValidation";
import { getAdminUser } from "@/lib/sessionUser";

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  try {
    await connectDB();
    const articles = await Article.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ articles: articles.map((article) => ({ ...article, _id: String(article._id) })) });
  } catch {
    return NextResponse.json({ error: "دریافت مقالات انجام نشد" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser("create");
  if (!admin) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  const validation = validateArticleInput(body);
  if (validation.error || !validation.data) {
    return NextResponse.json({ error: validation.error || "اطلاعات مقاله نامعتبر است" }, { status: 400 });
  }

  try {
    await connectDB();
    let slug = validation.data.slug;
    let suffix = 2;
    while (await Article.exists({ slug })) {
      const suffixText = `-${suffix}`;
      slug = `${createArticleSlug(validation.data.slug).slice(0, 220 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
    const article = await Article.create({
      ...validation.data,
      slug,
      published: admin.role === "super_admin" && validation.data.published,
    });
    return NextResponse.json({ article: { ...article.toObject(), _id: String(article._id) } }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: "نشانی مقاله تکراری است" }, { status: 409 });
    }
    return NextResponse.json({ error: "ثبت مقاله انجام نشد" }, { status: 500 });
  }
}