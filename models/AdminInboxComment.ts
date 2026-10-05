import mongoose, { Schema, models } from "mongoose";

const AdminInboxCommentSchema = new Schema(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: "Consultation", required: true },
    consultationName: { type: String, required: true, maxlength: 220 },
    consultationPhone: { type: String, required: true, maxlength: 40 },
    consultationType: { type: String, required: true, maxlength: 120 },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, maxlength: 160 },
    authorRole: { type: String, enum: ["admin", "super_admin"], required: true },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

const AdminInboxComment = models.AdminInboxComment || mongoose.model("AdminInboxComment", AdminInboxCommentSchema);
export default AdminInboxComment;