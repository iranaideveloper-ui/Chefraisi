import mongoose, { Schema, models } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "site" },
    siteName: { type: String, default: "فراز برتر رامونا", trim: true, maxlength: 80 },
    siteDescription: { type: String, default: "مشاوره، طراحی، آموزش و راه‌اندازی رستوران‌ها صفر تا صد", trim: true, maxlength: 200 },
    phone: { type: String, default: "۰۲۱-۱۲۳۴۵۶۷۸", trim: true, maxlength: 40 },
    email: { type: String, default: "info@farazbetar.ir", trim: true, maxlength: 160 },
    address: { type: String, default: "تهران، ستارخان، بین توحیدی و تهران ویلا (محله تهران ویلا)", trim: true, maxlength: 500 },
    whatsapp: { type: String, default: "۰۹۱۲۷۳۵۱۱۲۴", trim: true, maxlength: 40 },
    instagram: { type: String, default: "https://instagram.com/fermo_cafe", trim: true, maxlength: 300 },
    bale: { type: String, default: "https://bale.ai/", trim: true, maxlength: 300 },
    logo: { type: String, default: "/logo.png", trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const SiteSettings = models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
export default SiteSettings;