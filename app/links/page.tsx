'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Instagram,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  FileText,
  MessageSquare,
} from 'lucide-react';

type SiteSettings = {
  phone: string;
  whatsapp: string;
  instagram: string;
  bale: string;
  instagramUrl?: string;
  baleUrl?: string;
  mapUrl?: string;
  catalogPdfUrl?: string;
};

type SocialLink = {
  title: string;
  subtitle: string;
  url: string;
  icon: typeof Globe;
  color: string;
  iconColor: string;
  isExternal: boolean;
  onClick?: () => void;
};

const fallbackSettings: SiteSettings = {
  phone: '02166516492',
  whatsapp: '09127351124',
  instagram: 'https://instagram.com/fermo_cafe',
  bale: 'https://bale.ai/',
  instagramUrl: 'https://instagram.com/fermo_cafe',
  baleUrl: 'https://bale.ai/',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=35.7196944,51.3623611',
  catalogPdfUrl: '',
};

function createSocialLinks(settings: SiteSettings): SocialLink[] {
  const instagramUrl = settings.instagramUrl || settings.instagram;
  const baleUrl = settings.baleUrl || settings.bale;

  return [
  {
    title: 'وب‌سایت رسمی فراز برتر رامونا',
    subtitle: 'مشاهده دوره‌ها، پروژه‌ها و رزرو مشاوره',
    url: '/',
    icon: Globe,
    color: 'hover:border-amber-400/80 hover:bg-amber-500/10',
    iconColor: 'text-amber-400',
    isExternal: false,
  },
  {
    title: 'مشاوره آنلاین در واتس‌اپ',
    subtitle: 'ارتباط مستقیم با تیم پشتیبانی',
    url: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`,
    icon: MessageCircle,
    color: 'hover:border-emerald-500/80 hover:bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    isExternal: true,
  },
  {
    title: 'تماس تلفنی مستقیم',
    subtitle: 'پاسخگویی در ساعات کاری',
    url: 'tel:02166516492',
    icon: Phone,
    color: 'hover:border-blue-500/80 hover:bg-blue-500/10',
    iconColor: 'text-blue-400',
    isExternal: false,
  },
  {
    title: 'مسیریابی و لوکیشن دفتر',
    subtitle: 'مشاهده آدرس دقیق روی نقشه',
    url: settings.mapUrl || fallbackSettings.mapUrl || '#',
    icon: MapPin,
    color: 'hover:border-rose-500/80 hover:bg-rose-500/10',
    iconColor: 'text-rose-400',
    isExternal: true,
  },
  {
    title: 'صفحه رسمی اینستاگرام',
    subtitle: 'دنبال کردن ویدیوها و آموزش‌های جدید',
    url: instagramUrl,
    icon: Instagram,
    color: 'hover:border-pink-500/80 hover:bg-pink-500/10',
    iconColor: 'text-pink-400',
    isExternal: true,
  },
  {
    title: 'پشتیبانی در بله',
    subtitle: 'ارتباط مستقیم با تیم پشتیبانی',
    url: baleUrl,
    icon: MessageSquare,
    color: 'hover:border-orange-500/80 hover:bg-orange-500/10',
    iconColor: 'text-orange-400',
    isExternal: true,
  },
  {
    title: 'کاتالوگ جامع خدمات و دوره‌ها',
    subtitle: 'دانلود نسخه الکترونیکی (PDF)',
    url: settings.catalogPdfUrl || '#',
    icon: FileText,
    color: 'hover:border-amber-400/80 hover:bg-amber-500/10',
    iconColor: 'text-amber-300',
    isExternal: Boolean(settings.catalogPdfUrl),
    onClick: settings.catalogPdfUrl ? undefined : () => alert('فایل کاتالوگ در حال آماده‌سازی نهایی است.'),
  },
  ];
}

export default function LinksPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackSettings);

  useEffect(() => {
    fetch('/api/site-settings', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        setSettings((current) => ({ ...current, ...result.settings }));
      })
      .catch(() => undefined);
  }, []);

  const socialLinks = createSocialLinks(settings);

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-8 text-neutral-100 selection:bg-amber-500 selection:text-black sm:px-6"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(217,119,6,0.18),transparent_70%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <div className="group relative">
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-amber-500 to-yellow-600 opacity-75 blur-md transition duration-500 group-hover:opacity-100" />
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/80 bg-neutral-900 shadow-2xl">
            <Image
              src="/assets/images/faraz-logo.png"
              alt="فراز برتر رامونا"
              width={96}
              height={96}
              className="object-contain p-2"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="bg-linear-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-2xl font-black tracking-wide text-transparent">
            فراز برتر رامونا (Chef Raisi)
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-neutral-400">
           مشاوره، طراحی، آموزش و
راه اندازی رستوران‌ها صفر تا صد
          </p>
        </div>

        <div className="w-full space-y-3.5 pt-2">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            const handleClick = item.onClick
              ? (event: React.MouseEvent<HTMLAnchorElement>) => {
                  event.preventDefault();
                  item.onClick?.();
                }
              : undefined;
            const className = `group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 text-right shadow-lg shadow-black/40 backdrop-blur-md transition-all duration-300 active:scale-[0.98] ${item.color}`;

            const content = (
              <>
                <div className="flex items-center gap-3.5">
                  <div className={`rounded-xl border border-neutral-800/80 bg-neutral-950/80 p-2.5 transition-transform duration-300 group-hover:scale-110 ${item.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-100 transition-colors group-hover:text-amber-300">
                      {item.title}
                    </h2>
                    <p className="text-xs text-neutral-400 transition-colors group-hover:text-neutral-300">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className="pl-1 text-xs font-mono text-neutral-600 transition-colors group-hover:text-amber-400">←</span>
              </>
            );

            if (item.url === '/') {
              return <Link key={item.title} href={item.url} className={className}>{content}</Link>;
            }

            return (
              <a
                key={item.title}
                href={item.url === '#' ? '#' : item.url}
                onClick={handleClick}
                target={item.isExternal && item.url !== '#' ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={className}
              >
                {content}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-1 pt-6 text-xs text-neutral-500">
          <span>طراحی و توسعه پلتفرم توسط</span>
          <span className="font-semibold text-amber-400">King Hamed</span>
        </div>
      </div>
    </main>
  );
}
