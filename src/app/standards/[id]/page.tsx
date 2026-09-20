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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-moe-900 bg-moe-50 px-3 py-1 rounded-lg border-2 border-moe-200 dir-ltr inline-block shadow-2xs">
              معيار {standard.code}
            </span>
            <span className="text-xs text-slate-600 font-bold">
              تابع لـ: {standard.domain.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {standard.name}
          </h1>
          {standard.description && (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {standard.description}
            </p>
          )}
        </div>

        {/* كارت ملخص الإنجاز */}
        <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 min-w-[260px] space-y-3 shadow-2xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-bold">اكتمال شواهد المعيار:</span>
            <span className="font-black text-moe-800 text-sm dir-ltr inline-block">
              {completionRate}%
            </span>
          </div>
          <ProgressBar value={completionRate} showPercentage={false} size="md" colorClass="bg-moe-700" />
          <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 font-medium">
            <span>المؤشرات المكتملة:</span>
            <span className="font-bold text-slate-900">
              {completedIndicators} من {totalIndicators}
            </span>
          </div>
        </div>
      </div>

      {/* قائمة المؤشرات التابعة للمعيار */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">
          مؤشرات المعيار ({totalIndicators})
        </h2>

        <div className="space-y-3">
          {standard.indicators.map((ind) => {
            const hasApproved = ind.evidences.length > 0;
            return (
              <div
                key={ind.id}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5 hover:border-moe-400 hover:shadow-lg transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-moe-900 bg-moe-50 px-2.5 py-1 rounded-lg border-2 border-moe-200 dir-ltr inline-block shrink-0 mt-0.5 shadow-2xs">
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
                        <p className="text-xs text-slate-600 mt-1 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 font-medium">
                          <strong className="text-amber-900 font-bold">إرشادات المدرسة: </strong>
                          {ind.schoolGuidance}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {hasApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {ind.evidences.length} شاهد معتمد
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        لا توجد شواهد معتمدة
                      </span>
                    )}
                    <Link
                      href={`/indicators/${encodeURIComponent(ind.code)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-moe-800 hover:bg-moe-900 px-3.5 py-2 rounded-xl transition-all shadow-xs hover:shadow"
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
