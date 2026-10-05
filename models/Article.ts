import mongoose, { Schema, models } from "mongoose";

export type ArticleCategory = "launch" | "cooking" | "design" | "management" | "equipment" | "franchise";

type ArticleFields = {
  title: string;
  slug: string;
  category: ArticleCategory;
  readingTime: number;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ArticleSchema = new Schema<ArticleFields>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 220 },
    category: { type: String, enum: ["launch", "cooking", "design", "management", "equipment", "franchise"], required: true },
    readingTime: { type: Number, default: 5, min: 1, max: 180 },
    excerpt: { type: String, default: "", trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true },
    image: { type: String, default: "", trim: true, maxlength: 500 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Article = (models.Article as mongoose.Model<ArticleFields> | undefined)
  || mongoose.model<ArticleFields>("Article", ArticleSchema);
export default Article;