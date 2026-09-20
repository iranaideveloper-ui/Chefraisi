import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Consultation from "@/models/Consultation";
import { getSessionUser } from "@/lib/sessionUser";

type ConsultationPayload = {
  name?: string;
  family?: string;
  phone?: string;
  email?: string;
  consultationType?: string;
  description?: string;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });
  await connectDB();
  const consultations = await Consultation.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ consultations: consultations.map((consultation) => ({ ...consultation, id: String(consultation._id) })) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  let body: ConsultationPayload | null = null;
  try {
    body = (await request.json()) as ConsultationPayload;
  } catch {
    return NextResponse.json({ error: "داده ارسالی نامعتبر است" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "داده ارسالی نامعتبر است" }, { status: 400 });
  }

  const required = ["name", "family", "phone", "email", "consultationType"] as const;
  const payload: ConsultationPayload = {
    name: String(body.name ?? "").trim(),
    family: String(body.family ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    email: String(body.email ?? "").trim(),
    consultationType: String(body.consultationType ?? "").trim(),
    description: String(body.description ?? "").trim(),
  };

  for (const field of required) {
    if (!payload[field] || !String(payload[field]).trim()) {
      return NextResponse.json({ error: "لطفاً همه فیلدهای الزامی را تکمیل کنید" }, { status: 400 });
    }
  }

  await connectDB();

  const consultation = await Consultation.create({
    ...payload,
    userId: user?._id ?? null,
    userMobile: user?.mobile ?? payload.phone,
  });

  return NextResponse.json({ consultation }, { status: 201 });
}
