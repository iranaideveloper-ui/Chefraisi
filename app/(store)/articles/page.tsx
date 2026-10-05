import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import connectDB from "@/lib/mongodb";
import ArticleModel from "@/models/Article";
import { defaultArticlePresentation, defaultArticles } from "@/lib/defaultArticles";

export const metadata: Metadata = {
  title: { absolute: "مقالات و آموزش‌ها | فراز برتر رامونا" },
  description:
    "مقالات تخصصی فراز برتر رامونا درباره راه‌اندازی رستوران، آموزش آشپزی، آیا می‌دانید، تجهیزات آشپزخانه، فرانچایز و مدیریت کسب‌وکار.",
  alternates: { canonical: "/articles" },
};

type Category = "restaurant-setup" | "cooking" | "did-you-know" | "business" | "kitchen-equipment" | "franchise";
type StoredCategory = "launch" | "cooking" | "design" | "management" | "equipment" | "franchise";

const categoryLabels: Record<StoredCategory, Category> = {
  launch: "restaurant-setup",
  cooking: "cooking",
  design: "did-you-know",
  management: "business",
  equipment: "kitchen-equipment",
  franchise: "franchise",
};

type Article = {
  slug: string;
  title: string;
  category: Category;
  categoryLabel: string;
  date: string;
  readingTime: number;
  excerpt: string;
  image: string;
  imageAlt: string;
  body: string[];
};

const categories: { slug: "all" | Category; label: string }[] = [
  { slug: "all", label: "همه" },
  { slug: "restaurant-setup", label: "راه‌اندازی رستوران" },
  { slug: "cooking", label: "آموزش آشپزی" },
  { slug: "did-you-know", label: "آیا می‌دانید" },
  { slug: "business", label: "مدیریت و بیزینس" },
  { slug: "kitchen-equipment", label: "تجهیزات آشپزخانه" },
  { slug: "franchise", label: "فرانچایز" },
];

const fallbackArticles: Article[] = defaultArticles.map((article) => {
  const category = categoryLabels[article.category];
  const presentation = defaultArticlePresentation[article.slug];
  return {
    slug: article.slug,
    title: article.title,
    category,
    categoryLabel: categories.find(({ slug }) => slug === category)?.label ?? "مدیریت و بیزینس",
    date: presentation.date,
    readingTime: article.readingTime,
    excerpt: article.excerpt,
    image: article.image,
    imageAlt: presentation.imageAlt,
    body: article.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
  };
});

async function getArticles(): Promise<Article[]> {
  try {
    await connectDB();
    const records = await ArticleModel.find({ published: true }).sort({ createdAt: -1 }).lean();
    if (records.length === 0) return fallbackArticles;

    return records.map((record) => ({
      slug: record.slug,
      title: record.title,
      category: categoryLabels[record.category as StoredCategory] ?? "business",
      categoryLabel: categories.find(({ slug }) => slug === (categoryLabels[record.category as StoredCategory] ?? "business"))?.label ?? "مدیریت و بیزینس",
      date: record.createdAt ? new Date(record.createdAt).toLocaleDateString("fa-IR") : "",
      readingTime: record.readingTime || 5,
      excerpt: record.excerpt || "",
      image: record.image || "/assets/images/special-dishes-5.png",
      imageAlt: record.title,
      body: record.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    }));
  } catch {
    return fallbackArticles;
  }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, articles] = await Promise.all([searchParams, getArticles()]);
  const rawCategory = typeof params.category === "string" ? params.category : "all";
  const requestedCategory = rawCategory === "menu-design" ? "did-you-know" : rawCategory;
  const selectedCategory = categories.some(({ slug }) => slug === requestedCategory)
    ? requestedCategory
    : "all";
  const selectedArticle = typeof params.article === "string"
    ? articles.find(({ slug }) => slug === params.article)
    : undefined;
  const visibleArticles = selectedCategory === "all"
    ? articles
    : articles.filter(({ category }) => category === selectedCategory);

  if (selectedArticle) {
    return (
      <main className="viewport-min-height overflow-x-hidden bg-[#0a0a09] text-white selection:bg-[#d4af37] selection:text-[#0a0a09]">
        <article className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-8 sm:pt-36">
          <Link href={`/articles?category=${selectedCategory}`} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-400 transition hover:text-[#d4af37]">
            <ArrowRight className="h-4 w-4" /> بازگشت به مقالات
          </Link>
          <div className="relative mb-8 aspect-video overflow-hidden border border-[#d4af37]/35">
            <Image src={selectedArticle.image} alt={selectedArticle.imageAlt} fill priority sizes="(max-width: 768px) 100vw, 896px" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-4 right-4 border border-[#d4af37]/50 bg-black/70 px-3 py-1.5 text-xs font-bold text-[#f5d77d] backdrop-blur-sm">{selectedArticle.categoryLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-400">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#d4af37]" />{selectedArticle.date}</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#d4af37]" />{selectedArticle.readingTime} دقیقه مطالعه</span>
          </div>
          <h1 className="mt-5 wrap-break-word text-2xl font-black leading-relaxed text-stone-100 sm:text-4xl">{selectedArticle.title}</h1>
          <p className="mt-5 wrap-break-word border-r-2 border-[#d4af37] pr-4 text-base leading-8 text-stone-300">{selectedArticle.excerpt}</p>
          <div className="mt-8 space-y-5 whitespace-pre-wrap wrap-break-word text-sm leading-8 text-stone-300 sm:text-base sm:leading-9">
            {selectedArticle.body.map((paragraph) => <p key={paragraph} className="wrap-break-word">{paragraph}</p>)}
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="viewport-min-height overflow-x-hidden bg-[#0a0a09] text-white selection:bg-[#d4af37] selection:text-[#0a0a09]">
      <section className="relative isolate overflow-hidden border-b border-[#d4af37]/20 px-4 pb-10 pt-28 sm:px-8 sm:pb-8 sm:pt-28">
        <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#d4af37]/7 blur-3xl" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="min-w-0 text-right">
            <p className="mb-3 text-sm font-bold text-[#d4af37]">دانش برای کسب‌وکارهای غذایی</p>
            <h1 className="max-w-3xl text-2xl font-black leading-relaxed text-stone-100 sm:text-3xl lg:text-4xl">مقالات و یادداشت‌های تخصصی</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base sm:leading-8">تازه‌ترین مقالات در زمینه راه‌اندازی رستوران، آموزش آشپزی و اصول مدیریت کسب‌وکار</p>
          </div>
          <div className="hidden justify-center lg:flex" aria-hidden="true">
            <Image
              src="/assets/images/faraz-logo.png"
              alt=""
              width={320}
              height={320}
              priority
              className="h-56 w-56 object-contain xl:h-60 xl:w-60"
            />
          </div>
        </div>
      </section>

      <section id="articles" className="mx-auto max-w-7xl px-4 py-9 sm:px-8 sm:py-12 lg:px-10">
        <nav aria-label="دسته‌بندی مقالات" className="mb-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div role="tablist" className="flex w-max min-w-full gap-2 border-b border-white/10 sm:w-auto sm:min-w-0">
            {categories.map(({ slug, label }) => {
              const active = selectedCategory === slug;
              return (
                <Link
                  key={slug}
                  href={slug === "all" ? "/articles" : `/articles?category=${slug}`}
                  role="tab"
                  aria-selected={active}
                  className={`min-h-11 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-bold transition-colors ${active ? "border-[#d4af37] text-[#f5d77d]" : "border-transparent text-stone-400 hover:text-white"}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visibleArticles.map((article) => (
            <article key={article.slug} className="group flex min-w-0 flex-col overflow-hidden border border-white/10 bg-[#11110f] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/55 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
              <Link href={`/articles?article=${article.slug}&category=${selectedCategory}`} aria-label={`مطالعه مقاله: ${article.title}`} className="relative block aspect-video overflow-hidden border-b border-[#d4af37]/20">
                <Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
                <span className="absolute right-3 top-3 border border-[#d4af37]/45 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-[#f5d77d] backdrop-blur-sm">{article.categoryLabel}</span>
              </Link>
              <div className="flex grow flex-col p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-500">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#d4af37]" />{article.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#d4af37]" />{article.readingTime} دقیقه مطالعه</span>
                </div>
                <h2 className="line-clamp-2 wrap-break-word text-lg font-extrabold leading-8 text-stone-100 transition-colors group-hover:text-[#f5d77d]">{article.title}</h2>
                <p className="mt-2 line-clamp-3 wrap-break-word text-sm leading-7 text-stone-400">{article.excerpt}</p>
                <Link href={`/articles?article=${article.slug}&category=${selectedCategory}`} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#d4af37] transition hover:gap-3 hover:text-[#f5d77d]">
                  مطالعه بیشتر <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}