import mongoose, { Schema, models } from "mongoose";

const AboutContentSchema = new Schema(
  {
    key: { type: String, unique: true, default: "about" },
    heroTitle: { type: String, required: true, maxlength: 180 },
    heroAccent: { type: String, required: true, maxlength: 120 },
    heroDescription: { type: String, required: true, maxlength: 1000 },
    supportText: { type: String, required: true, maxlength: 180 },
    supportLink: { type: String, required: true, maxlength: 500 },
    slides: [{ image: { type: String, required: true, maxlength: 500 }, label: { type: String, required: true, maxlength: 120 }, detail: { type: String, required: true, maxlength: 180 } }],
    highlights: [{ label: { type: String, required: true, maxlength: 180 } }],
    services: [{ number: { type: String, required: true, maxlength: 10 }, title: { type: String, required: true, maxlength: 120 }, description: { type: String, required: true, maxlength: 300 }, items: { type: [String], required: true } }],
    processTitle: { type: String, required: true, maxlength: 180 },
    processDescription: { type: String, required: true, maxlength: 500 },
    processImage: { type: String, required: true, maxlength: 500 },
    process: [{ title: { type: String, required: true, maxlength: 120 }, text: { type: String, required: true, maxlength: 500 } }],
    consultationServices: [{ title: { type: String, required: true, maxlength: 120 }, description: { type: String, required: true, maxlength: 500 } }],
    ctaTitle: { type: String, required: true, maxlength: 180 },
    ctaDescription: { type: String, required: true, maxlength: 500 },
    ctaButton: { type: String, required: true, maxlength: 80 },
  },
  { timestamps: true },
);

const AboutContent = models.AboutContent || mongoose.model("AboutContent", AboutContentSchema);
export default AboutContent;
