import mongoose from "mongoose";
import Course from "@/models/Course";
import { fixedCourses } from "@/data/fixedCourses";

const legacyTitles: Record<string, string> = {
  "free-course": "دوره رایگان و مقدماتی",
  "restaurant-management": "دوره جامع مدیریت و راه‌اندازی رستوران",
  "master-chef": "دوره تخصصی مستر شف و مهندسی منو",
  "restaurant-finance": "دوره تخصصی مدیریت مالی و کنترل هزینه رستوران",
  "restaurant-marketing": "دوره تخصصی بازاریابی و فروش رستوران",
  "restaurant-design": "دوره تخصصی طراحی داخلی و تجربه مشتری",
};

export async function ensureFixedCourses() {
  for (const fixedCourse of fixedCourses) {
    const courseData = {
      image: fixedCourse.image,
      title: fixedCourse.title,
      description: fixedCourse.description,
      price: fixedCourse.price,
      isFree: fixedCourse.isFree,
      comingSoon: fixedCourse.comingSoon ?? false,
      category: fixedCourse.category,
    };
    try {
      if (fixedCourse.slug === "free-course") {
        await Course.updateOne(
          {
            slug: fixedCourse.slug,
            $or: [
              { price: { $ne: 0 } },
              { isFree: { $ne: true } },
              { discountPercent: { $ne: 0 } },
            ],
          },
          { $set: { price: 0, isFree: true, discountPercent: 0 } },
        );
      }
      const legacyTitle = legacyTitles[fixedCourse.slug];
      if (legacyTitle) {
        await Course.updateOne(
          { slug: fixedCourse.slug, title: legacyTitle },
          { $set: { title: fixedCourse.title } },
        );
      }
      await Course.updateOne(
        { slug: fixedCourse.slug },
        { $setOnInsert: { ...courseData, legacyId: fixedCourse.id, slug: fixedCourse.slug, lessons: [] } },
        { upsert: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) throw error;
    }
  }
}