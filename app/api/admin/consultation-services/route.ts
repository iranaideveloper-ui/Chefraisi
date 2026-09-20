import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AboutContent from "@/models/AboutContent";
import { defaultAboutContent, type ConsultationService } from "@/lib/aboutContent";
import { getAdminUser } from "@/lib/sessionUser";

function validate(value: unknown): ConsultationService[] | null {
  if (!Array.isArray(value) || value.length !== 5) return null;
  const services = value.map((service) => {
    const item = service as Record<string, unknown>;
    return { title: typeof item.title === "string" ? item.title.trim() : "", description: typeof item.description === "string" ? item.description.trim() : "" };
  });
  return services.every((service) => service.title && service.description) ? services : null;
}

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const content = await AboutContent.findOne({ key: "about" }).select("consultationServices").lean();
  return NextResponse.json({ services: content?.consultationServices?.length === 5 ? content.consultationServices : defaultAboutContent.consultationServices });
}

export async function PUT(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as { services?: unknown } | null;
  const services = validate(body?.services);
  if (!services) return NextResponse.json({ error: "هر پنج خدمت و توضیح آن‌ها را کامل کنید" }, { status: 400 });
  await connectDB();
  await AboutContent.findOneAndUpdate({ key: "about" }, { $set: { consultationServices: services } }, { upsert: true, setDefaultsOnInsert: true });
  return NextResponse.json({ services });
}