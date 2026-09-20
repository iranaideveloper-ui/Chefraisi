import mongoose, { Schema, models } from "mongoose";

const ConsultationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null },
    userMobile: { type: String, required: false, default: "" },
    name: { type: String, required: true, trim: true },
    family: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    consultationType: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "reviewed", "referred"], default: "pending" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
  },
  { timestamps: true },
);

const Consultation = models.Consultation || mongoose.model("Consultation", ConsultationSchema);
export default Consultation;
