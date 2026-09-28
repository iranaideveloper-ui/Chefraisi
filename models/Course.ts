import mongoose, { Schema, models } from "mongoose";

export interface ICourseLesson {
  _id?: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  duration?: string;
  isFreePreview?: boolean;
  order?: number;
}

type CourseFields = {
  legacyId?: number;
  slug?: string;
  image: string;
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  isFree: boolean;
  comingSoon: boolean;
  category: "cooking" | "design" | "management" | "complete";
  lessons: ICourseLesson[];
  createdAt: Date;
  updatedAt: Date;
};

const LessonSchema = new Schema<ICourseLesson>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    videoUrl: { type: String, required: true, trim: true, maxlength: 2000 },
    duration: { type: String, default: "", trim: true, maxlength: 20 },
    isFreePreview: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0 },
  },
  { _id: true },
);

const CourseSchema = new Schema<CourseFields>(
  {
    legacyId: { type: Number, unique: true, sparse: true },
      slug: { type: String, unique: true, sparse: true, trim: true, maxlength: 80 },
    image: { type: String, required: true, trim: true, maxlength: 500 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 99 },
    isFree: { type: Boolean, default: false },
    comingSoon: { type: Boolean, default: false },
    category: { type: String, enum: ["cooking", "design", "management", "complete"], required: true },
    lessons: { type: [LessonSchema], default: [] },
  },
  { timestamps: true },
);

const Course = (models.Course as mongoose.Model<CourseFields> | undefined)
  || mongoose.model<CourseFields>("Course", CourseSchema);
export default Course;