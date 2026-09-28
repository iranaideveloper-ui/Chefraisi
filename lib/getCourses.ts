import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import { coursesData, type Course as StaticCourse } from "@/data/coursesData";
import { fixedCourses } from "@/data/fixedCourses";
import { ensureFixedCourses } from "@/lib/ensureFixedCourses";

export type PublicCourseLesson = {
  title: string;
  videoUrl?: string;
  duration?: string;
  isFreePreview?: boolean;
  order?: number;
};

export type PublicCourse = StaticCourse & {
  discountPercent: number;
  discountedPrice: number;
  lessons: PublicCourseLesson[];
  slug?: string;
  comingSoon?: boolean;
};

function isUsableText(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !/^untitled\s*\d*$/i.test(value.trim()) && !/[ÃÂØÙ]/.test(value);
}

export async function getPublicCourses(): Promise<PublicCourse[]> {
  try {
    await connectDB();
    if (await Course.countDocuments() === 0) {
      await Course.insertMany(coursesData.map((course) => ({ ...course, legacyId: course.id })));
    }
    await ensureFixedCourses();
    const courses = await Course.find().sort({ legacyId: 1, createdAt: 1 }).lean();
    const uniqueCourses = new Map<number, (typeof courses)[number]>();
    for (const course of courses) {
      const legacyId = course.legacyId;
      if (typeof legacyId === "number" && !uniqueCourses.has(legacyId)) uniqueCourses.set(legacyId, course);
    }

    const legacyCourses = coursesData.map((fallback) => {
      const course = uniqueCourses.get(fallback.id);
      const discountPercent = course && Number.isFinite(course.discountPercent) ? course.discountPercent : fallback.isFree ? 0 : 0;
      const price = course && Number.isFinite(course.price) ? course.price : fallback.price;
      return {
        id: fallback.id,
        image: course && isUsableText(course.image) ? course.image : fallback.image,
        title: course && isUsableText(course.title) ? course.title : fallback.title,
        description: course && isUsableText(course.description) ? course.description : fallback.description,
        price,
        discountPercent,
        discountedPrice: course?.isFree || fallback.isFree ? 0 : Math.round(price * (1 - discountPercent / 100)),
        isFree: course?.isFree ?? fallback.isFree,
        category: course?.category || fallback.category,
        lessons: (course?.lessons ?? []).map((lesson) => ({
          title: lesson.title,
          ...(lesson.isFreePreview ? { videoUrl: lesson.videoUrl } : {}),
          duration: lesson.duration || "",
          isFreePreview: Boolean(lesson.isFreePreview),
          order: lesson.order ?? 0,
        })),
      };
    });
    const fixed = fixedCourses.map((fallback) => {
      const stored = courses.find((course) => course.slug === fallback.slug);
      const comingSoon = stored?.comingSoon ?? fallback.comingSoon ?? false;
      const storedDescription = stored && isUsableText(stored.description) ? stored.description : fallback.description;
      const description = fallback.comingSoon
        ? storedDescription.replace(/؛\s*به‌زودی منتشر می‌شود\.?$/, "")
        : storedDescription;
      const storedPrice = stored && Number.isFinite(stored.price) ? stored.price : fallback.price;
      const price = comingSoon ? 0 : storedPrice;
      return {
        ...fallback,
        image: stored && isUsableText(stored.image) ? stored.image : fallback.image,
        title: stored && isUsableText(stored.title) ? stored.title : fallback.title,
        description,
        price,
        discountPercent: stored?.discountPercent ?? 0,
        discountedPrice: stored?.isFree || fallback.isFree ? 0 : Math.round(price * (1 - (stored?.discountPercent ?? 0) / 100)),
        isFree: stored?.isFree ?? fallback.isFree,
        comingSoon,
        lessons: (stored?.lessons ?? []).map((lesson) => ({
          title: lesson.title,
          ...(lesson.isFreePreview ? { videoUrl: lesson.videoUrl } : {}),
          duration: lesson.duration || "",
          isFreePreview: Boolean(lesson.isFreePreview),
          order: lesson.order ?? 0,
        })),
      };
    });
    return [...legacyCourses, ...fixed];
  } catch {
    const legacyCourses = coursesData.map((course) => ({
      ...course,
      discountPercent: 0,
      discountedPrice: course.isFree ? 0 : course.price,
      lessons: [],
    }));
    return [...legacyCourses, ...fixedCourses.map((course) => ({
      ...course,
      discountPercent: 0,
      discountedPrice: course.isFree ? 0 : course.price,
      lessons: [],
    }))];
  }
}