import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ChevronRight, ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function DomainPage({ params }: PageProps) {
  const setting = await prisma.schoolSetting.findFirst();
  const isGov = setting ? setting.schoolType === 'government' : true;

  const domain = await prisma.domain.findFirst({
    where: {
      OR: [{ id: params.id }, { code: params.id }],
    },
    include: {
      standards: {
        orderBy: { sortOrder: 'asc' },
        include: {
          indicators: {
            where: isGov ? { appliesToGovernment: true } : {},
            orderBy: { sortOrder: 'asc' },
            include: {
              evidences: {
                where: { status: 'approved' },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!domain) {
    notFound();
  }

  let totalIndicators = 0;
  let completedIndicators = 0;

  const standardsData = domain.standards.map((std) => {
    const stdIndicators = std.indicators;
    const stdCompleted = stdIndicators.filter((ind) => ind.evidences.length > 0).length;

    totalIndicators += stdIndicators.length;
    completedIndicators += stdCompleted;

    const completionRate =
      stdIndicators.length > 0
        ? Math.round((stdCompleted / stdIndicators.length) * 100)
        : 0;

    return {
      ...std,
      indicatorsCount: stdIndicators.length,
      completedCount: stdCompleted,
      completionRate,
    };
  });

  const domainCompletionRate =
    totalIndicators > 0 ? Math.round((completedIndicators / totalIndicators) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* مسار التصفح (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-moe-800 transition-colors">
          الرئيسية
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <Link href="/#domains-section" className="hover:text-moe-800 transition-colors">
          المجالات
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <span className="text-slate-800 font-semibold">{domain.name}</span>
      </nav>

      {/* رأس صفحة المجال */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-moe-50 text-moe-800 text-xs px-3 py-1 rounded-md font-bold border border-moe-200">
            المجال {domain.code}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {domain.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {domain.description}
          </p>
        </div>

        {/* كارت ملخص الإنجاز */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 min-w-[260px] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">اكتمال شواهد المجال:</span>
            <span className="font-bold text-moe-800 text-sm dir-ltr inline-block">
              {domainCompletionRate}%
            </span>
          </div>
          <ProgressBar value={domainCompletionRate} showPercentage={false} size="md" />
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>المعايير: {standardsData.length}</span>
            <span>المؤشرات المكتملة: {completedIndicators} من {totalIndicators}</span>
          </div>
        </div>
      </div>

      {/* استعراض معايير المجال */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-moe-700" />
          <span>معايير {domain.name} ({standardsData.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {standardsData.map((std) => (
            <div
              key={std.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              {/* شريط رأس المعيار */}
              <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-moe-800 bg-white px-2.5 py-0.5 rounded border border-moe-200 dir-ltr inline-block">
                      معيار {std.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{std.name}</h3>
                  </div>
                  {std.description && (
                    <p className="text-xs text-slate-500 max-w-2xl">{std.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">اكتمال الشواهد:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {std.completedCount} من {std.indicatorsCount} مؤشر
                    </span>
                  </div>
                  <Link
                    href={`/standards/${std.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-moe-800 bg-white hover:bg-moe-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-moe-200 transition-colors shadow-sm"
                  >
                    <span>عرض التفاصيل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* قائمة مؤشرات المعيار السريعة */}
              <div className="p-6">
                <div className="space-y-3">
                  {std.indicators.map((ind) => {
                    const hasApproved = ind.evidences.length > 0;
                    return (
                      <Link
                        key={ind.id}
                        href={`/indicators/${encodeURIComponent(ind.code)}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-moe-200 hover:bg-slate-50/80 transition-all gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold text-moe-800 bg-slate-100 group-hover:bg-moe-100 px-2 py-1 rounded border border-slate-200 group-hover:border-moe-300 dir-ltr inline-block shrink-0 mt-0.5">
                            {ind.code}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 group-hover:text-moe-950 font-medium leading-relaxed">
                            {ind.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {hasApproved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {ind.evidences.length} شاهد معتمد
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              لا توجد شواهد معتمدة
                            </span>
                          )}
                          <span className="text-xs text-moe-700 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                            فتح <ArrowLeft className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
