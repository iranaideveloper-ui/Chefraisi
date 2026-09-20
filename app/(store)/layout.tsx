import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: {
    default: "فراز برتر رامونا | مشاوره و راه‌اندازی رستوران",
    template: "%s | فراز برتر رامونا",
  },
  description: "مشاوره تخصصی، طراحی، آموزش و راه‌اندازی رستوران از ایده تا افتتاح و رشد پایدار.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "فراز برتر رامونا | مشاوره و راه‌اندازی رستوران",
    description: "همراه شما برای ساخت یک کسب‌وکار رستورانی حرفه‌ای و ماندگار.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <CartProvider>
      <header>
        <Navbar />
      </header>
      <div className="viewport-min-height overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </div>

      <footer>
        <Footer />
      </footer>
    </CartProvider>
  );
}
