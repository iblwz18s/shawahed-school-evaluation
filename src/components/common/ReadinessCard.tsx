import React from 'react';
import { Gauge, FileCheck2, Info } from 'lucide-react';
import { ProgressRing } from '@/components/common/ProgressRing';

/**
 * بطاقة مستوى الجاهزية (Readiness Card) — قابلة لإعادة الاستخدام
 * -------------------------------------------------------------
 * ملخّص بصري حديث لمستوى اكتمال الشواهد: حلقة تقدّم + عنوان + أرقام
 * على شكل شرائح. بلا أي مكتبة خارجية (SVG + Tailwind + lucide-react).
 *
 * كل النصوص قابلة للتمرير من الخارج حتى تُستخدم في أي صفحة تحتاج
 * ملخّص جاهزية بغير هذه الأرقام.
 */

export interface ReadinessCardProps {
  /** نسبة الاكتمال 0-100 */
  rate: number;
  /** عدد المؤشرات المكتملة */
  completed: number;
  /** إجمالي المؤشرات */
  total: number;
  /** إجمالي الشواهد المعتمدة المتاحة */
  approvedEvidencesCount: number;
  title?: string;
  eyebrow?: string;
  /** سطر توضيحي أسفل العنوان */
  description?: string;
  /** ملاحظة صغيرة في الشريحة الثانية */
  note?: string;
  className?: string;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({
  rate,
  completed,
  total,
  approvedEvidencesCount,
  title = 'مستوى جاهزية الشواهد المعتمدة بالمدرسة',
  eyebrow = 'ملخّص الجاهزية',
  description,
  note = '* الإحصائية تخص الشواهد المعتمدة رسميًا فقط',
  className = '',
}) => {
  const clampedRate = Math.min(Math.max(Math.round(rate), 0), 100);
  const descriptionText =
    description ?? `اكتمال الشواهد للمؤشرات: ${completed} من ${total} مؤشرًا`;

  return (
    <article
      className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden ${className}`}
    >
      {/* شريط لوني علوي بهوية المنصة (تركوازي → ذهبي) */}
      <div className="h-1.5 w-full bg-gradient-to-l from-moe-800 via-moe-600 to-gold-400" />

      <div className="p-5 sm:p-7">
        {/* ثلاثة أعمدة على الشاشات الكبيرة: الحلقة ← النصوص ← الشرائح
            حتى يمتلئ عرض البطاقة الكامل بلا فراغ جانبي. */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          {/* حلقة التقدّم */}
          <ProgressRing
            value={clampedRate}
            size={116}
            thickness={10}
            caption="نسبة الاكتمال"
            className="self-center lg:self-auto"
          />

          {/* النصوص */}
          <div className="flex-1 min-w-0 space-y-3 text-right">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-moe-800 bg-moe-50 border border-moe-200 px-2.5 py-0.5 rounded-full">
              <Gauge className="w-3.5 h-3.5 text-moe-700" aria-hidden="true" />
              <span>{eyebrow}</span>
            </span>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {descriptionText}
            </p>
          </div>

          {/* الشرائح — عمود مستقل على الشاشات الكبيرة */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch shrink-0 lg:w-[300px]">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                إجمالي الشواهد المعتمدة المتاحة:{' '}
                <strong className="text-slate-900 font-black tabular-nums">
                  {approvedEvidencesCount}
                </strong>
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>{note}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
