import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import { coursesData, type Course as StaticCourse } from "@/data/coursesData";

export type PublicCourse = StaticCourse & {
  discountPercent: number;
  discountedPrice: number;
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
    const courses = await Course.find().sort({ legacyId: 1, createdAt: 1 }).lean();
    const uniqueCourses = new Map<number, (typeof courses)[number]>();
    for (const course of courses) {
      const legacyId = course.legacyId;
      if (typeof legacyId === "number" && !uniqueCourses.has(legacyId)) uniqueCourses.set(legacyId, course);
    }

    return coursesData.map((fallback) => {
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
      };
    });
  } catch {
    return coursesData.map((course) => ({
      ...course,
      discountPercent: 0,
      discountedPrice: course.isFree ? 0 : course.price,
    }));
  }
}