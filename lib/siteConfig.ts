// تنظیمات سایت
export const siteConfig = {
  siteName: 'فراز برتر رامونا',
  description: 'مشاوره، طراحی، آموزش و راه‌اندازی رستوران‌ها صفر تا صد',
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  email: 'info@farazbetar.ir',
  address: 'تهران، خیابان ولیعصر',
  facebook: 'https://facebook.com/farazbetar',
  instagram: 'https://instagram.com/farazbetar',
  whatsapp: '۰۹۱۲۱۲۳۴۵۶۷',
  baleSupportLink: 'https://bale.ai/your-admin-username',
  logo: '/logo.png',
  currency: 'تومان',
  language: 'fa',
  timezone: 'Asia/Tehran',
  supportEmail: 'support@farazbetar.ir',
  supportPhone: '۰۲۱-۱۲۳۴۵۶۷۸',
};

// تنظیمات رنگ‌ها
export const colorConfig = {
  primary: '#d4af37', // طلایی
  dark: '#050505', // تیره
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// صفحات اصلی
export const pages = {
  home: '/',
  about: '/about',
  menu: '#menu',
  contact: '#contact',
  userPanel: '/user-panel',
  adminPanel: '/admin',
  auth: '/auth',
};

// منوی سایت
export const navigationMenu = [
  { href: '/', label: 'خانه' },
  { href: '/about', label: 'درباره ما' },
  { href: '#menu', label: 'آموزش' },
  { href: '#contact', label: 'تماس با ما' },
];

// منوی پنل کاربر
export const userPanelMenu = [
  { href: '/user-panel/consultations', label: 'درخواست مشاوره‌های من', icon: 'consultations' },
  { href: '/user-panel/courses', label: 'دوره های ثبت‌نام شده', icon: 'courses' },
  { href: '/user-panel/payments', label: 'پرداخت‌ها', icon: 'payments' },
  { href: '/user-panel/userInfo', label: 'اطلاعات کاربری', icon: 'userInfo' },
];

// منوی پنل ادمین
export const adminMenu = [
  { href: '/admin', label: 'داشبورد', icon: 'home', category: 'management' },
  { href: '/admin/consultations', label: 'درخواست‌های مشاوره', icon: 'consultations', category: 'management' },
  { href: '/admin/courses', label: 'مدیریت دوره‌ها', icon: 'courses', category: 'management' },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: 'users', category: 'management' },
  { href: '/admin/projects', label: 'مدیریت پروژه‌ها', icon: 'projects', category: 'management' },
  { href: '/admin/team', label: 'مدیریت دپارتمان‌ها', icon: 'team', category: 'website' },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: 'payments', category: 'management' },
  { href: '/admin/reports', label: 'گزارشات و آمار', icon: 'reports', category: 'management' },
  { divider: true },
  { href: '/admin/content', label: 'دوره‌های آموزشی', icon: 'content', category: 'website' },
  { href: '/admin/homepage', label: 'صفحه خانه', icon: 'home', category: 'website' },
  { href: '/admin/about', label: 'درباره ما', icon: 'about', category: 'website' },
  { href: '/admin/settings', label: 'تنظیمات سایت', icon: 'settings', category: 'settings' },
];
