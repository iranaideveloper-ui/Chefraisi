export interface AboutSlide {
  image: string;
  label: string;
  detail: string;
}

export interface AboutHighlight {
  label: string;
}

export interface AboutService {
  number: string;
  title: string;
  description: string;
  items: string[];
}

export interface AboutProcessStep {
  title: string;
  text: string;
}

export interface ConsultationService {
  title: string;
  description: string;
}

export interface AboutContent {
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  supportText: string;
  supportLink: string;
  slides: AboutSlide[];
  highlights: AboutHighlight[];
  services: AboutService[];
  processTitle: string;
  processDescription: string;
  processImage: string;
  process: AboutProcessStep[];
  consultationServices: ConsultationService[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export const defaultAboutContent: AboutContent = {
  heroTitle: "ایده‌تان را به یک",
  heroAccent: "تجربه ماندگار",
  heroDescription: "فراز برتر رامونا، شریک تخصصی شما در مسیر طراحی، تجهیز، آموزش و راه‌اندازی کسب‌وکارهای غذایی است؛ از اولین تصمیم تا روزهای رشد.",
  supportText: "شروع یک گفت‌وگوی حرفه‌ای با تیم پشتیبانی",
  supportLink: "https://bale.ai/",
  slides: [
    { image: "/assets/images/gallery-1.jpg", label: "پروژه‌های راه‌اندازی", detail: "از ایده تا افتتاح" },
    { image: "/assets/images/gallery-2.jpg", label: "طراحی و اجرا", detail: "ساخت تجربه‌ای متفاوت" },
    { image: "/assets/images/gallery-3.jpg", label: "پروژه‌های راه‌اندازی", detail: "جزئیات، امضای یک برند" },
    { image: "/assets/images/chef-1.jpg", label: "تیم فراز برتر", detail: "تجربه‌ای که همراه شماست" },
    { image: "/assets/images/chef-2.jpg", label: "تیم فراز برتر", detail: "تخصص در خدمت پروژه شما" },
    { image: "/assets/images/chef-3.jpg", label: "آموزش و استانداردسازی", detail: "تیم آماده، عملیات ماندگار" },
  ],
  highlights: [
    { label: "همراهی از ایده تا افتتاح" },
    { label: "راهکار متناسب با هر پروژه" },
    { label: "استانداردسازی برای رشد پایدار" },
  ],
  services: [
    { number: "۰۱", title: "استراتژی و مشاوره", description: "تصمیم‌های درست، پیش از شروع پروژه", items: ["مشاوره در اجرای پلن‌های مختلف", "مشاوره در خرید مواد اولیه، انبارداری و چرخه تولید", "مشاوره در امور تبلیغات و فضای مجازی", "قرارداد پشتیبانی سالانه"] },
    { number: "۰۲", title: "طراحی و هویت برند", description: "ساخت فضایی که دیده و به یاد سپرده شود", items: ["طراحی صفر تا صد آشپزخانه، سالن، کافه و روف", "اجرای انواع طرح‌ها و طراحی لوگوی پروژه", "مشاوره و طراحی کامل سایت و نرم‌افزار پروژه", "مشاوره خرید اکسسوری، کامپیوتر و برنامه رستوران"] },
    { number: "۰۳", title: "تجهیز و اجرا", description: "تبدیل نقشه و ایده به یک عملیات آماده", items: ["مشاوره کامل خرید تجهیزات آشپزخانه و سالن", "نصب و راه‌اندازی تجهیزات معمولی و صنعتی", "مشاوره و اجرای کامل سم‌پاشی پروژه"] },
    { number: "۰۴", title: "منو و آموزش تیم", description: "تجربه‌ای یکدست، از آشپزخانه تا میز مهمان", items: ["منونویسی و آموزش منو به پرسنل آشپزخانه", "آموزش بار سرد و گرم", "آموزش پذیرایی و سرو غذا و نوشیدنی به پرسنل سالن و کافه"] },
  ],
  processTitle: "از تصمیم تا نتیجه، یک مسیر روشن",
  processDescription: "ایده، هدف و ظرفیت کسب‌وکار شما را دقیق بررسی می‌کنیم.",
  processImage: "/assets/images/about us 3.jpg",
  process: [
    { title: "شناخت پروژه", text: "ایده، هدف و ظرفیت کسب‌وکار شما را دقیق بررسی می‌کنیم." },
    { title: "طراحی و اجرا", text: "راهکار منسجم را از نقشه تا تجهیز و آموزش پیش می‌بریم." },
    { title: "پشتیبانی رشد", text: "کنار شما می‌مانیم تا عملیات با کیفیت و ثبات ادامه پیدا کند." },
  ],
  consultationServices: [
    { title: "مشاوره تخصصی", description: "بررسی بازار، تحلیل رقبا و برنامه‌ریزی دقیق برای رشد کسب‌وکار." },
    { title: "طراحی و معماری", description: "طراحی داخلی حرفه‌ای، چیدمان و تجربه مشتری‌محور برای فضا." },
    { title: "آموزش و راه‌اندازی", description: "آموزش تیم، سرویس‌دهی، سیستم‌های عملیاتی و اجرا در سطح حرفه‌ای." },
    { title: "برندسازی و بازاریابی", description: "ساخت هویت متمایز و طراحی مسیر جذب و حفظ مشتریان هدف." },
    { title: "مدیریت و توسعه", description: "بهینه‌سازی عملیات، کنترل هزینه‌ها و برنامه‌ریزی برای رشد پایدار." },
  ],
  ctaTitle: "پروژه بعدی شما از همین‌جا شروع می‌شود.",
  ctaDescription: "برای بررسی ایده و دریافت مشاوره تخصصی، با ما در ارتباط باشید.",
  ctaButton: "درخواست مشاوره",
};
