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
  const content = mergeWithDefaults(body as Record<string, unknown>);
  if (!Array.isArray(content.slides) || !content.slides.length || !Array.isArray(content.services) || !content.services.length || !Array.isArray(content.process) || !content.process.length) {
    return NextResponse.json({ error: "اسلایدها، خدمات و مراحل همکاری را کامل کنید" }, { status: 400 });
  }
  await connectDB();
  const saved = await AboutContent.findOneAndUpdate({ key: "about" }, content, { upsert: true, new: true, runValidators: true }).lean();
  return NextResponse.json({ content: saved });
}
