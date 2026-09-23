'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Accordion, AccordionItem } from '@/components/common/Accordion';

/**
 * بطاقة مجال التقويم (Domain Card) — قابلة لإعادة الاستخدام
 * ---------------------------------------------------------
 * بطاقة أنيقة تعرض المجال، وتحته قائمة معايير قابلة للفتح (أكورديون)
 * ويظهر داخل كل معيار مؤشراته الفرعية مع حالة الشواهد المعتمدة.
 *
 * الرابط إلى صفحة المجال الكاملة والمعايير يبقى كما هو دون أي تغيير في الـRouting.
 */

export interface DomainCardIndicatorData {
  id: string;
  code: string;
  text: string;
  approvedEvidencesCount: number;
}

export interface DomainCardStandardData {
  id: string;
  code: string;
  name: string;
  indicatorsCount: number;
  completedCount: number;
  completionRate: number;
  indicators: DomainCardIndicatorData[];
}

export interface DomainCardData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  totalStandards: number;
  totalIndicators: number;
  completedIndicators: number;
  completionRate: number;
  standards: DomainCardStandardData[];
}

export interface DomainCardProps {
  domain: DomainCardData;
  /** أيقونة المجال (عنصر React من lucide-react) */
  icon: React.ReactNode;
  /** يفتح أول معيار تلقائيًا — مفيد عند وجود 4 مجالات فقط */
  expandFirstStandard?: boolean;
}

/** لون نسبة إكمال المعيار حسب تقدّمها */
const ratePillClass = (rate: number) => {
  if (rate >= 100) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (rate > 0) return 'bg-moe-50 text-moe-800 border-moe-200';
  return 'bg-slate-100 text-slate-500 border-slate-200';
};

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  icon,
  expandFirstStandard = false,
}) => {
  return (
    <article className="group bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-moe-400 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col">
      {/* شريط لوني علوي بهوية المنصة (تركوازي → ذهبي) */}
      <div className="h-1.5 w-full bg-gradient-to-l from-moe-800 via-moe-600 to-gold-400 shrink-0" />

      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* رأس البطاقة */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-moe-50 to-moe-100 border-2 border-moe-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-moe-700 tracking-wider block">
                المجال {domain.code}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-moe-900 transition-colors">
                {domain.name}
              </h3>
            </div>
          </div>

          {/* نسبة الإكمال */}
          <div className="text-left shrink-0">
            <div className="text-lg sm:text-xl font-black text-moe-800 dir-ltr">
              {domain.completionRate}%
            </div>
            <span className="text-[10px] text-slate-500 block whitespace-nowrap">
              اكتمال الشواهد
            </span>
          </div>
        </div>

        {domain.description && (
          <p className="text-xs text-slate-600 leading-relaxed">{domain.description}</p>
        )}

        {/* شريط التقدّم + ملخّص الأرقام */}
        <div className="space-y-2.5">
          <ProgressBar
            value={domain.completionRate}
            showPercentage={false}
            size="sm"
            colorClass="bg-moe-700"
          />
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {domain.totalStandards} معايير
            </span>
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-moe-50 text-moe-800 border border-moe-200">
              {domain.completedIndicators} من {domain.totalIndicators} مؤشر مكتمل
            </span>
          </div>
        </div>

        {/* المعايير المندرجة + المؤشرات الفرعية (أكورديون) */}
        <div className="space-y-2 pt-1 flex-1">
          <span className="text-[11px] font-bold text-slate-500 block">
            المعايير المندرجة والمؤشرات الفرعية:
          </span>

          <Accordion>
            {domain.standards.map((std, index) => (
              <AccordionItem
                key={std.id}
                defaultOpen={expandFirstStandard && index === 0}
                eyebrow={
                  <span className="font-mono text-[10px] font-bold text-moe-800 bg-moe-50 px-2 py-0.5 rounded border border-moe-200 dir-ltr inline-block shrink-0 mt-0.5">
                    {std.code}
                  </span>
                }
                title={std.name}
                subtitle={`${std.completedCount} من ${std.indicatorsCount} مؤشر بشاهد معتمد`}
                meta={
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap dir-ltr ${ratePillClass(
                      std.completionRate
                    )}`}
                  >
                    {std.completionRate}%
                  </span>
                }
              >
                <div className="space-y-2">
                  {std.indicators.length > 0 ? (
                    std.indicators.map((ind) => (
                      <Link
                        key={ind.id}
                        href={`/indicators/${encodeURIComponent(ind.code)}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-200 hover:border-moe-400 hover:bg-moe-50/40 transition-all group/ind"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="font-mono text-[11px] font-bold text-moe-800 bg-slate-100 group-hover/ind:bg-moe-100 px-2 py-0.5 rounded border border-slate-200 group-hover/ind:border-moe-300 dir-ltr inline-block shrink-0">
                            {ind.code}
                          </span>
                          <p className="text-[11px] sm:text-xs text-slate-700 group-hover/ind:text-moe-950 font-medium leading-relaxed">
                            {ind.text}
                          </p>
                        </div>

                        <div className="shrink-0 self-end sm:self-center">
                          {ind.approvedEvidencesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              {ind.approvedEvidencesCount} شاهد معتمد
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              لا توجد شواهد معتمدة
                            </span>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 px-1 py-2">
                      لا توجد مؤشرات مطبقة على هذا المعيار.
                    </p>
                  )}

                  <Link
                    href={`/standards/${std.id}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-moe-800 hover:text-moe-900 bg-moe-50 hover:bg-moe-100 px-3 py-1.5 rounded-lg border border-moe-200 transition-colors"
                  >
                    <span>تفاصيل المعيار كاملة</span>
                    <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* تذييل البطاقة */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-600 font-medium">
            إجمالي المؤشرات:{' '}
            <strong className="text-slate-900 font-bold">{domain.totalIndicators}</strong>
          </span>
          <Link
            href={`/domains/${domain.id}`}
            className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-moe-800 hover:bg-moe-900 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all group/btn"
          >
            <span>استعراض المعايير والمؤشرات</span>
            <ArrowLeft
              className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};
