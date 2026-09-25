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
  instagramUrl: "https://instagram.com/fermo_cafe",
  baleUrl: "https://bale.ai/",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=35.7196944,51.3623611",
  mapEmbedUrl: "https://www.google.com/maps?q=35.7196944,51.3623611&hl=fa&z=16&output=embed",
  baladUrl: "https://balad.ir/p/rbvkLS_x4QW8?preview=true#15/35.720/51.363",
  neshanUrl: "https://neshan.org/maps/places/rbvkLS_x4QW8#c35.720-51.363",
  catalogPdfUrl: "",
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