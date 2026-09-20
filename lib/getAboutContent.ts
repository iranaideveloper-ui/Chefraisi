import connectDB from "@/lib/mongodb";
import { defaultAboutContent, type AboutContent } from "@/lib/aboutContent";
import AboutContentModel from "@/models/AboutContent";

function normalizeAboutContent(value: Record<string, unknown>): AboutContent {
  const slides = Array.isArray(value.slides)
    ? value.slides.map((slide) => ({
        image: String((slide as Record<string, unknown>).image ?? ""),
        label: String((slide as Record<string, unknown>).label ?? ""),
        detail: String((slide as Record<string, unknown>).detail ?? ""),
      }))
    : defaultAboutContent.slides;
  const highlights = Array.isArray(value.highlights)
    ? value.highlights.map((highlight) => ({ label: String((highlight as Record<string, unknown>).label ?? "") }))
    : defaultAboutContent.highlights;
  const services = Array.isArray(value.services)
    ? value.services.map((service) => {
        const item = service as Record<string, unknown>;
        return {
          number: String(item.number ?? ""),
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          items: Array.isArray(item.items) ? item.items.map(String) : [],
        };
      })
    : defaultAboutContent.services;
  const process = Array.isArray(value.process)
    ? value.process.map((step) => ({
        title: String((step as Record<string, unknown>).title ?? ""),
        text: String((step as Record<string, unknown>).text ?? ""),
      }))
    : defaultAboutContent.process;
  const consultationServices = Array.isArray(value.consultationServices)
    ? value.consultationServices.slice(0, 5).map((service) => ({
        title: String((service as Record<string, unknown>).title ?? ""),
        description: String((service as Record<string, unknown>).description ?? ""),
      }))
    : defaultAboutContent.consultationServices;

  return {
    ...defaultAboutContent,
    slides,
    highlights,
    services,
    process,
    consultationServices: consultationServices.length === 5 ? consultationServices : defaultAboutContent.consultationServices,
    heroTitle: String(value.heroTitle ?? defaultAboutContent.heroTitle),
    heroAccent: String(value.heroAccent ?? defaultAboutContent.heroAccent),
    heroDescription: String(value.heroDescription ?? defaultAboutContent.heroDescription),
    supportText: String(value.supportText ?? defaultAboutContent.supportText),
    supportLink: String(value.supportLink ?? defaultAboutContent.supportLink),
    processTitle: String(value.processTitle ?? defaultAboutContent.processTitle),
    processDescription: String(value.processDescription ?? defaultAboutContent.processDescription),
    processImage: String(value.processImage ?? defaultAboutContent.processImage),
    ctaTitle: String(value.ctaTitle ?? defaultAboutContent.ctaTitle),
    ctaDescription: String(value.ctaDescription ?? defaultAboutContent.ctaDescription),
    ctaButton: String(value.ctaButton ?? defaultAboutContent.ctaButton),
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    await connectDB();
    const content = await AboutContentModel.findOne({ key: "about" }).lean();
    return normalizeAboutContent((content ?? {}) as Record<string, unknown>);
  } catch {
    return defaultAboutContent;
  }
}
