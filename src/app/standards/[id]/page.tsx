import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ChevronRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProgressBar } from '@/components/common/ProgressBar';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function StandardPage({ params }: PageProps) {
  const setting = await prisma.schoolSetting.findFirst();
  const isGov = setting ? setting.schoolType === 'government' : true;

  const standard = await prisma.standard.findFirst({
    where: {
      OR: [{ id: params.id }, { code: params.id }],
    },
    include: {
      domain: true,
      indicators: {
        where: isGov ? { appliesToGovernment: true } : {},
        orderBy: { sortOrder: 'asc' },
        include: {
          evidences: {
            where: { status: 'approved' },
            select: { id: true, title: true, url: true, evidenceType: true },
          },
        },
      },
    },
  });

  if (!standard) {
    notFound();
  }

  const totalIndicators = standard.indicators.length;
  const completedIndicators = standard.indicators.filter(
    (ind) => ind.evidences.length > 0
  ).length;
  const completionRate =
    totalIndicators > 0 ? Math.round((completedIndicators / totalIndicators) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* مسار التصفح */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-moe-800 transition-colors">
          الرئيسية
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <Link href={`/domains/${standard.domain.id}`} className="hover:text-moe-800 transition-colors">
          {standard.domain.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <span className="text-slate-800 font-semibold">{standard.name}</span>
      </nav>

      {/* رأس صفحة المعيار */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-moe-800 bg-moe-50 px-2.5 py-0.5 rounded border border-moe-200 dir-ltr inline-block">
              معيار {standard.code}
            </span>
            <span className="text-xs text-slate-500">
              تابع لـ: {standard.domain.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {standard.name}
          </h1>
          {standard.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {standard.description}
            </p>
          )}
        </div>

        {/* كارت ملخص الإنجاز */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 min-w-[260px] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">اكتمال شواهد المعيار:</span>
            <span className="font-bold text-moe-800 text-sm dir-ltr inline-block">
              {completionRate}%
            </span>
          </div>
          <ProgressBar value={completionRate} showPercentage={false} size="md" />
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>المؤشرات المكتملة:</span>
            <span className="font-bold text-slate-700">
              {completedIndicators} من {totalIndicators}
            </span>
          </div>
        </div>
      </div>

      {/* قائمة المؤشرات التابعة للمعيار */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          مؤشرات المعيار ({totalIndicators})
        </h2>

        <div className="space-y-3">
          {standard.indicators.map((ind) => {
            const hasApproved = ind.evidences.length > 0;
            return (
              <div
                key={ind.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:border-moe-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-moe-800 bg-moe-50 px-2.5 py-1 rounded-lg border border-moe-200 dir-ltr inline-block shrink-0 mt-0.5">
                      {ind.code}
                    </span>
                    <div>
                      <Link
                        href={`/indicators/${encodeURIComponent(ind.code)}`}
                        className="text-sm font-bold text-slate-900 hover:text-moe-800 transition-colors leading-relaxed block"
                      >
                        {ind.text}
                      </Link>
                      {ind.schoolGuidance && (
                        <p className="text-xs text-slate-500 mt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                          <strong className="text-amber-800">إرشادات المدرسة: </strong>
                          {ind.schoolGuidance}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {hasApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {ind.evidences.length} شاهد معتمد
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        لا توجد شواهد معتمدة
                      </span>
                    )}
                    <Link
                      href={`/indicators/${encodeURIComponent(ind.code)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-moe-800 bg-slate-50 hover:bg-moe-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-moe-200 transition-colors"
                    >
                      <span>عرض الشواهد</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* روابط سريعة للشواهد المعتمدة إن وجدت */}
                {hasApproved && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-400 font-medium self-center text-[11px]">
                      الشواهد المتاحة:
                    </span>
                    {ind.evidences.map((e) => (
                      <a
                        key={e.id}
                        href={e.evidenceType === 'report' ? `/reports/${e.id}` : (e.url || '#')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-moe-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{e.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
