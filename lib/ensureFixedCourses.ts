import mongoose from "mongoose";
import Course from "@/models/Course";
import { fixedCourses } from "@/data/fixedCourses";

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