export const articleCategories = ["launch", "cooking", "design", "management"] as const;
export type ArticleCategory = (typeof articleCategories)[number];

export type ArticleInput = {
  title: string;
  slug: string;
  category: ArticleCategory;
  readingTime: number;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
};

export function createArticleSlug(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export function validateArticleInput(input: unknown): { data?: ArticleInput; error?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "بدنه درخواست نامعتبر است" };
  }

  const body = input as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = body.category;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const slugInput = typeof body.slug === "string" && body.slug.trim() ? body.slug : title;
  const slug = createArticleSlug(slugInput);
  if (typeof body.readingTime === "string" && body.readingTime.trim().length > 20) {
    return { error: "زمان مطالعه نمی‌تواند بیشتر از ۲۰ کاراکتر باشد" };
  }
  const readingTime = body.readingTime === undefined || body.readingTime === null || body.readingTime === ""
    ? 5
    : Number(body.readingTime);

  if (!title || !category || !content) return { error: "عنوان، دسته‌بندی و متن مقاله الزامی است" };
  if (title.length > 100) return { error: "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد" };
  if (excerpt.length > 180) return { error: "چکیده نمی‌تواند بیشتر از ۱۸۰ کاراکتر باشد" };
  if (content.length > 10000) return { error: "متن مقاله نمی‌تواند بیشتر از ۱۰۰۰۰ کاراکتر باشد" };
  if (image.length > 500) return { error: "نشانی تصویر نامعتبر است" };
  if (!slug) return { error: "عنوان برای ساخت نشانی مقاله معتبر نیست" };
  if (!articleCategories.includes(category as ArticleCategory)) return { error: "دسته‌بندی مقاله نامعتبر است" };
  if (!Number.isInteger(readingTime) || readingTime < 1 || readingTime > 180) {
    return { error: "زمان مطالعه باید عددی بین ۱ تا ۱۸۰ دقیقه باشد" };
  }
  if (body.published !== undefined && body.published !== null && typeof body.published !== "boolean") {
    return { error: "وضعیت انتشار نامعتبر است" };
  }

  return {
    data: {
      title,
      slug,
      category: category as ArticleCategory,
      readingTime,
      excerpt,
      content,
      image,
      published: body.published !== false,
    },
  };
}