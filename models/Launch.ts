import mongoose, { Schema, models } from "mongoose";

const LaunchSchema = new Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    sourceProjectId: { type: Schema.Types.ObjectId, ref: "Project", unique: true, sparse: true },
    image: { type: String, required: true, trim: true, maxlength: 500 },
    restaurantName: { type: String, required: true, trim: true, maxlength: 160 },
    launchYear: { type: Number, required: true, min: 1300, max: 1600 },
    cuisine: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    servicesProvided: { type: [String], default: [] },
    status: { type: String, enum: ["open", "renovated"], default: "open" },
  },
  { timestamps: true },
);

const Launch = models.Launch || mongoose.model("Launch", LaunchSchema);
export default Launch;
