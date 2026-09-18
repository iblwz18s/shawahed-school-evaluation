import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LandingBackdrop } from '@/components/layout/LandingBackdrop';

export const metadata: Metadata = {
  title: 'منصة شواهد التقويم المدرسي | المعايير الرسمية 2026م',
  description:
    'بوابة توثيق وتنظيم شواهد التقويم والاعتماد المدرسي المعتمدة من هيئة تقويم التعليم والتدريب بالمملكة العربية السعودية.',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-arabic overflow-x-hidden relative">
        <LandingBackdrop />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full max-w-full">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
