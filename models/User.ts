import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: [true, "نام الزامی است"], trim: true },
    lastName: { type: String, required: [true, "نام خانوادگی الزامی است"], trim: true },
    mobile: {
      type: String,
      required: [true, "شماره موبایل الزامی است"],
      unique: true,
      match: [/^09\d{9}$/, "شماره موبایل معتبر نیست"],
      trim: true,
    },
    password: { type: String, required: [true, "رمز عبور الزامی است"] },
    passwordResetCodeHash: { type: String, default: null },
    passwordResetCodeExpiresAt: { type: Date, default: null },
    passwordResetCodeSentAt: { type: Date, default: null },
    passwordResetAttempts: { type: Number, default: 0 },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    avatar: { type: String, default: "", trim: true },
    role: { type: String, enum: ["user", "admin", "super_admin"], default: "user" },
    permissions: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);
export default User;
