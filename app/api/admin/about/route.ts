import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { defaultAboutContent } from "@/lib/aboutContent";
import AboutContent from "@/models/AboutContent";
import { getSessionUser } from "@/lib/sessionUser";

async function authorized() {
  const user = await getSessionUser();
  return user?.role === "super_admin";
}

function mergeWithDefaults(value: Record<string, unknown>) {
  const content = { ...value };
  delete content._id;
  delete content.key;
  delete content.createdAt;
  delete content.updatedAt;
  return { ...defaultAboutContent, ...content, key: "about" };
}

function validateContentLengths(value: Record<string, unknown>): string | null {
  const checks: Array<{ value: unknown; max: number; label: string }> = [
    { value: value.heroTitle, max: 80, label: "عنوان اصلی" },
    { value: value.heroAccent, max: 80, label: "عنوان طلایی" },
    { value: value.supportText, max: 80, label: "متن پشتیبانی" },
    { value: value.processTitle, max: 80, label: "عنوان روش همکاری" },
    { value: value.ctaTitle, max: 80, label: "عنوان پایانی" },
    { value: value.ctaButton, max: 80, label: "متن دکمه پایانی" },
    { value: value.heroDescription, max: 250, label: "متن معرفی" },
    { value: value.ctaDescription, max: 250, label: "توضیح پایانی" },
    { value: value.processDescription, max: 2500, label: "متن اصلی" },
  ];

  for (const [index, slide] of (Array.isArray(value.slides) ? value.slides : []).entries()) {
    if (!slide || typeof slide !== "object") continue;
    const entry = slide as Record<string, unknown>;
    checks.push(
      { value: entry.label, max: 80, label: `عنوان اسلاید ${index + 1}` },
      { value: entry.detail, max: 250, label: `توضیح اسلاید ${index + 1}` },
    );
  }
  for (const [index, highlight] of (Array.isArray(value.highlights) ? value.highlights : []).entries()) {
    if (highlight && typeof highlight === "object") checks.push({ value: (highlight as Record<string, unknown>).label, max: 250, label: `معرفی کوتاه ${index + 1}` });
  }
  for (const [index, service] of (Array.isArray(value.services) ? value.services : []).entries()) {
    if (!service || typeof service !== "object") continue;
    const entry = service as Record<string, unknown>;
    checks.push(
      { value: entry.title, max: 80, label: `عنوان خدمت ${index + 1}` },
      { value: entry.description, max: 250, label: `توضیح خدمت ${index + 1}` },
      { value: Array.isArray(entry.items) ? entry.items.join("\n") : entry.items, max: 2500, label: `متن خدمت ${index + 1}` },
    );
  }
  for (const [index, step] of (Array.isArray(value.process) ? value.process : []).entries()) {
    if (!step || typeof step !== "object") continue;
    const entry = step as Record<string, unknown>;
    checks.push(
      { value: entry.title, max: 80, label: `عنوان مرحله ${index + 1}` },
      { value: entry.text, max: 2500, label: `متن مرحله ${index + 1}` },
    );
  }
  for (const [index, service] of (Array.isArray(value.consultationServices) ? value.consultationServices : []).entries()) {
    if (!service || typeof service !== "object") continue;
    const entry = service as Record<string, unknown>;
    checks.push(
      { value: entry.title, max: 80, label: `عنوان خدمت مشاوره ${index + 1}` },
      { value: entry.description, max: 250, label: `توضیح خدمت مشاوره ${index + 1}` },
    );
  }

  const exceeded = checks.find(({ value: text, max }) => typeof text === "string" && text.trim().length > max);
  return exceeded ? `${exceeded.label} نمی‌تواند بیشتر از ${exceeded.max} کاراکتر باشد` : null;
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "فقط مدیر ارشد به این بخش دسترسی دارد" }, { status: 403 });
  await connectDB();
  const content = await AboutContent.findOne({ key: "about" }).lean();
  return NextResponse.json({ content: mergeWithDefaults((content ?? {}) as Record<string, unknown>) });
}

export async function PUT(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "فقط مدیر ارشد به این بخش دسترسی دارد" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "اطلاعات ارسالی نامعتبر است" }, { status: 400 });
  const lengthError = validateContentLengths(body as Record<string, unknown>);
  if (lengthError) return NextResponse.json({ error: lengthError }, { status: 400 });
  const content = mergeWithDefaults(body as Record<string, unknown>);
  if (!Array.isArray(content.slides) || !content.slides.length || !Array.isArray(content.services) || !content.services.length || !Array.isArray(content.process) || !content.process.length) {
    return NextResponse.json({ error: "اسلایدها، خدمات و مراحل همکاری را کامل کنید" }, { status: 400 });
  }
  await connectDB();
  const saved = await AboutContent.findOneAndUpdate({ key: "about" }, content, { upsert: true, new: true, runValidators: true }).lean();
  return NextResponse.json({ content: saved });
}
