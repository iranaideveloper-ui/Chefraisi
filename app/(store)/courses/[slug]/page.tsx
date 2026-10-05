import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/sessionUser";
import { fixedCourses } from "@/data/fixedCourses";
import FixedCourseViewer from "@/components/FixedCourseViewer";
import type { FixedCourseViewData } from "@/components/FixedCourseViewer";

type PageProps = { params: Promise<{ slug: string }> };
type StoredCourse = {
  title?: string;
  description?: string;
  image: string;
  price: number;
  isFree?: boolean;
  comingSoon?: boolean;
  lessons: Array<{
    _id?: unknown;
    title: string;
    videoUrl: string;
    duration?: string;
    isFreePreview?: boolean;
    order?: number;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = fixedCourses.find((item) => item.slug === slug);
  if (!course) return { title: "دوره یافت نشد" };
  try {
    await connectDB();
    const stored = await Course.findOne({ slug }).select("title description").lean();
    return { title: stored?.title || course.title, description: stored?.description || course.description };
  } catch {
    return { title: course.title, description: course.description };
  }
}

export default async function FixedCoursePage({ params }: PageProps) {
  const { slug } = await params;
  const definition = fixedCourses.find((item) => item.slug === slug);
  if (!definition) notFound();

  let storedCourse: StoredCourse | null = null;
  let purchased = false;
  let isFree = definition.isFree === true;
  try {
    await connectDB();
    const stored = await Course.findOne({ slug: definition.slug }).lean();
    storedCourse = stored ? { title: stored.title, description: stored.description, image: stored.image, price: stored.price, isFree: stored.isFree, comingSoon: stored.comingSoon, lessons: stored.lessons } : null;
    isFree = storedCourse?.isFree ?? isFree;
    const user = await getSessionUser();
    if (user && !isFree) {
      purchased = Boolean(await Order.exists({
        userId: user._id,
        status: "paid",
        "items.id": definition.id,
      }));
    }
  } catch {
    storedCourse = null;
  }

  const hasFullAccess = isFree || purchased;
  const comingSoon = storedCourse?.comingSoon ?? definition.comingSoon ?? false;
  const lessons = (storedCourse?.lessons ?? []).map((lesson) => ({
    _id: String(lesson._id),
    title: lesson.title,
    ...((hasFullAccess || lesson.isFreePreview) ? { videoUrl: lesson.videoUrl } : {}),
    duration: lesson.duration || "",
    isFreePreview: Boolean(lesson.isFreePreview),
    order: lesson.order ?? 0,
  }));

  const course: FixedCourseViewData = {
    id: definition.id,
    slug: definition.slug,
    title: storedCourse?.title || definition.title,
    description: storedCourse?.description || definition.description,
    image: storedCourse?.image || definition.image,
    price: comingSoon ? 0 : storedCourse?.price ?? definition.price,
    isFree,
    comingSoon,
    purchased,
    lessons,
  };

  return <FixedCourseViewer course={course} />;
}