import mongoose, { Schema, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    restaurantName: { type: String, required: true, trim: true, maxlength: 160 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    cuisine: { type: String, required: true, trim: true, maxlength: 120 },
    launchYear: { type: Number, required: true, min: 1300, max: 1600 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    image: { type: String, default: "/assets/images/gallery-1.jpg", trim: true, maxlength: 500 },
    servicesProvided: { type: [String], default: [] },
    sourceConsultationId: { type: Schema.Types.ObjectId, ref: "Consultation", unique: true, sparse: true },
    status: { type: String, enum: ["open", "renovated"], default: "open" },
  },
  { timestamps: true },
);

const Project = models.Project || mongoose.model("Project", ProjectSchema);
export default Project;
