import mongoose, { Schema, models } from "mongoose";

const CourseSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    image: { type: String, required: true, trim: true, maxlength: 500 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 99 },
    isFree: { type: Boolean, default: false },
    category: { type: String, enum: ["cooking", "design", "management", "complete"], required: true },
  },
  { timestamps: true },
);

const Course = models.Course || mongoose.model("Course", CourseSchema);
export default Course;