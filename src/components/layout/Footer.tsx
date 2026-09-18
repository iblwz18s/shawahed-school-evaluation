import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* العمود 1: عن المنصة */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>منصة شواهد التقويم المدرسي</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              نظام رقمي مدرسي لتنظيم وتوثيق وأرشفة شواهد ومعايير التقويم والتصنيف والاعتماد المدرسي وفق وثيقة الإصدار الثاني 2026م الصادرة عن هيئة تقويم التعليم والتدريب، مخصص لخدمة منسوبي المدرسة وفريق التقويم الخارجي.
            </p>
            <div className="pt-1 text-[11px] text-slate-500">
              * ملحوظة: إحصائيات اكتمال الشواهد تعبر عن توفر الشواهد التوثيقية ولا تمثل درجة التقويم الرسمية للمدرسة.
            </div>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              روابط المنصة
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-300 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/#domains-section" className="hover:text-emerald-300 transition-colors">
                  المجالات والمعايير
                </Link>
              </li>
              <li>
                <Link href="/about-evaluation" className="hover:text-emerald-300 transition-colors">
                  أدوات التقويم الـ 12
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-300 transition-colors">
                  بوابة دخول المنسوبين
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود 3: المرجعيات الرسمية */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              المرجعيات الرسمية
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1 text-slate-400">
                <span>هيئة تقويم التعليم والتدريب</span>
              </li>
              <li className="flex items-center gap-1 text-slate-400">
                <span>وزارة التعليم بالمملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-1 text-slate-400">
                <span>منصة تميز للتقويم المدرسي</span>
              </li>
            </ul>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            جميع الحقوق محفوظة للمدرسة © {new Date().getFullYear()} م — الإصدار 1.0 (MVP)
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>بوابة مخصصة للمراجعة والتقويم المدرسي</span>
            <span>•</span>
            <span>RTL / IBM Plex Sans Arabic</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
