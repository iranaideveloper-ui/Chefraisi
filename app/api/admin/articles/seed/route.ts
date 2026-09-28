import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { defaultArticles } from "@/lib/defaultArticles";
import { isDuplicateKeyError } from "@/lib/articleValidation";
import Article from "@/models/Article";
import { getAdminUser } from "@/lib/sessionUser";

export async function POST() {
  if (!await getAdminUser("create")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  try {
    await connectDB();
    const insertedSlugs: string[] = [];
    const skippedSlugs: string[] = [];

    for (const article of defaultArticles) {
      if (await Article.exists({ slug: article.slug })) {
        skippedSlugs.push(article.slug);
        continue;
      }

      try {
        await Article.create(article);
        insertedSlugs.push(article.slug);
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;
        skippedSlugs.push(article.slug);
      }
    }

    return NextResponse.json({
      insertedCount: insertedSlugs.length,
      skippedCount: skippedSlugs.length,
      insertedSlugs,
      skippedSlugs,
    });
  } catch {
    return NextResponse.json({ error: "اتصال به پایگاه داده یا درون‌ریزی مقالات انجام نشد" }, { status: 503 });
  }
}