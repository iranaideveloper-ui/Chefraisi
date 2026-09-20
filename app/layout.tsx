import "./globals.css";
import "../public/assets/css/main.css";
import BottomNav from "../components/ui/BottomNav";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "شف رئیسی | فراز برتر رامونا",
  description: "خدمات تخصصی راه اندازی رستوران، مشاوره آشپزی و آموزش رستوران‌داری.",
  url: siteUrl || "http://localhost:3000",
  areaServed: "IR",
  serviceType: ["راه اندازی رستوران", "مشاوره آشپزی", "آموزش رستوران داری"],
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "فراز برتر رامونا | مشاوره و راه‌اندازی رستوران",
    template: "%s | فراز برتر رامونا",
  },
  description: "مشاوره تخصصی، طراحی، آموزش و راه‌اندازی رستوران از ایده تا افتتاح و رشد پایدار.",
  keywords: ["راه‌اندازی رستوران", "مشاوره رستوران", "آموزش آشپزی", "طراحی رستوران"],
  icons: {
    icon: "/assets/images/faraz-logo.png",
    apple: "/assets/images/faraz-logo.png",
  },
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title: "فراز برتر رامونا | مشاوره و راه‌اندازی رستوران",
    description: "همراه شما برای ساخت یک کسب‌وکار رستورانی حرفه‌ای و ماندگار.",
    locale: "fa_IR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// RESPONSIVE FIX: Enable viewport-fit so mobile safe-area insets work on Samsung and iOS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="viewport-min-height overflow-x-hidden">
      {/* RESPONSIVE FIX: Prevent accidental horizontal overflow across mobile routes. */}
      <body className="viewport-min-height overflow-x-hidden antialiased" dir="rtl">
        {children}
        {/* Mobile bottom navigation */}
        <BottomNav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
