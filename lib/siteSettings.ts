import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export const defaultSiteSettings = {
  siteName: "فراز برتر رامونا",
  siteDescription: "مشاوره، طراحی، آموزش و راه‌اندازی رستوران‌ها صفر تا صد",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "info@farazbetar.ir",
  address: "تهران، ستارخان، بین توحیدی و تهران ویلا (محله تهران ویلا)",
  whatsapp: "۰۹۱۲۷۳۵۱۱۲۴",
  instagram: "https://instagram.com/fermo_cafe",
  bale: "https://bale.ai/",
  logo: "/logo.png",
};

export async function getSiteSettings() {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne({ key: "site" }).lean();
    const stored = settings ?? {};
    return Object.fromEntries(Object.keys(defaultSiteSettings).map((key) => [key, stored[key as keyof typeof stored] ?? defaultSiteSettings[key as keyof typeof defaultSiteSettings]])) as typeof defaultSiteSettings;
  } catch {
    return defaultSiteSettings;
  }
}