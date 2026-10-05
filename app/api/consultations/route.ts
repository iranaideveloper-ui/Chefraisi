import { after, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Consultation from "@/models/Consultation";
import User from "@/models/User";
import { getSessionUser } from "@/lib/sessionUser";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMelliPayamakSms } from "@/lib/passwordReset";

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

  const rateLimitResponse = enforceRateLimit({
    key: `consultation:submit:${getClientIp(request)}`,
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  await connectDB();

  const consultation = await Consultation.create({
    ...payload,
    userId: user?._id ?? null,
    userMobile: user?.mobile ?? payload.phone,
  });

  after(async () => {
    try {
      const superAdmin = await User.findOne({ role: "super_admin" }).select("mobile").lean();
      if (!superAdmin?.mobile) return;
      const smsField = (value: string, maxLength: number) => value.replace(/\s+/g, " ").trim().slice(0, maxLength);
      const details = [
        "درخواست جدید مشاوره",
        `نام: ${smsField(`${payload.name} ${payload.family}`, 80)}`,
        `شماره تماس: ${smsField(payload.phone || "", 24)}`,
        `ایمیل: ${smsField(payload.email || "", 80)}`,
        `نوع: ${smsField(payload.consultationType || "", 50)}`,
        ...(payload.description ? [`توضیحات: ${smsField(payload.description, 140)}`] : []),
      ];
      await sendMelliPayamakSms(superAdmin.mobile, details.join(" | "));
    } catch (error) {
      console.error("Super-admin consultation SMS notification failed:", error instanceof Error ? error.message : error);
    }
  });

  return NextResponse.json({ consultation }, { status: 201 });
}
