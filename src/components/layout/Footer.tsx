import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, BookOpen } from 'lucide-react';

// ملف معايير الإصدار الثاني 2026م (رابط رسمي خارجي)
const SECOND_EDITION_FILE_URL =
  'https://drive.google.com/file/d/19_lJWRfqtmWrvcWamtOWXIkL4slWE1dU/view?usp=drivesdk';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* تعريف مختصر بالمنصة */}
        <div className="text-center md:text-right space-y-1">
          <div className="flex items-center gap-2 text-white font-bold text-sm justify-center md:justify-start">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>منصة شواهد — التقويم المدرسي</span>
          </div>
          <p className="text-[11px] leading-relaxed max-w-md">
            منصة لتوثيق وأرشفة شواهد ومعايير التقويم المدرسي (الذاتي والخارجي).
          </p>
          <p className="text-[11px] text-slate-500">
            المرجع الرسمي: هيئة تقويم التعليم والتدريب.
          </p>
        </div>

        {/* الأزرار والروابط الرسمية */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <Link
            href="/#domains-section"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>المجالات والمعايير</span>
          </Link>
          <a
            href={SECOND_EDITION_FILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ملف الإصدار الثاني 2026م</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
