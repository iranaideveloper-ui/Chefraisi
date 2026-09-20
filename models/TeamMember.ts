import mongoose, { Schema, models } from "mongoose";

const TeamMemberSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    image: { type: String, required: true, trim: true, maxlength: 500 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    tagline: { type: String, required: true, trim: true, maxlength: 160 },
    services: {
      type: [String],
      required: true,
      default: [],
      validate: { validator: (services: string[]) => services.length <= 3, message: "حداکثر سه خدمت مجاز است" },
    },
  },
  { timestamps: true },
);

const TeamMember = models.TeamMember || mongoose.model("TeamMember", TeamMemberSchema);
export default TeamMember;
