import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getSessionUser } from "@/lib/sessionUser";
import Course from "@/models/Course";
import Order from "@/models/Order";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });

  const courseId = Number((await params).id);
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return NextResponse.json({ error: "شناسه دوره نامعتبر است" }, { status: 400 });
  }

  await connectDB();
  const course = await Course.findOne({ legacyId: courseId }).select("legacyId title isFree lessons").lean();
  if (!course) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

  if (!course.isFree) {
    const enrollment = await Order.exists({
      userId: user._id,
      status: "paid",
      "items.id": courseId,
    });
    if (!enrollment) return NextResponse.json({ error: "برای مشاهده این دوره ثبت‌نام کنید" }, { status: 403 });
  }

  return NextResponse.json({
    course: {
      id: course.legacyId,
      title: course.title,
      isFree: course.isFree,
      lessons: (course.lessons ?? []).map((lesson) => ({
        _id: String(lesson._id),
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || "",
        isFreePreview: Boolean(lesson.isFreePreview),
        order: lesson.order ?? 0,
      })),
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}