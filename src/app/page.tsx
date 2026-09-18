import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SearchBar } from '@/components/search/SearchBar';
import { ProgressBar } from '@/components/common/ProgressBar';
import {
  Building2,
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const setting = await prisma.schoolSetting.findFirst();
  const isGov = setting ? setting.schoolType === 'government' : true;

  // جلب المجالات مع المعايير والمؤشرات
  const domains = await prisma.domain.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      standards: {
        orderBy: { sortOrder: 'asc' },
        include: {
          indicators: {
            where: isGov ? { appliesToGovernment: true } : {},
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

  // حساب الإحصائيات العامة
  let totalIndicators = 0;
  let indicatorsWithApproved = 0;
  let totalApprovedEvidences = 0;

  const domainStats = domains.map((domain) => {
    let domainTotalIndicators = 0;
    let domainCompletedIndicators = 0;
    let domainEvidencesCount = 0;

    domain.standards.forEach((std) => {
      std.indicators.forEach((ind) => {
        domainTotalIndicators++;
        if (ind.evidences.length > 0) {
          domainCompletedIndicators++;
          domainEvidencesCount += ind.evidences.length;
        }
      });
    });

    totalIndicators += domainTotalIndicators;
    indicatorsWithApproved += domainCompletedIndicators;
    totalApprovedEvidences += domainEvidencesCount;

    const completionRate =
      domainTotalIndicators > 0
        ? Math.round((domainCompletedIndicators / domainTotalIndicators) * 100)
        : 0;

    return {
      id: domain.id,
      code: domain.code,
      name: domain.name,
      description: domain.description,
      iconName: domain.iconName,
      totalStandards: domain.standards.length,
      totalIndicators: domainTotalIndicators,
      completedIndicators: domainCompletedIndicators,
      completionRate,
      standards: domain.standards,
    };
  });

  const overallCompletionRate =
    totalIndicators > 0 ? Math.round((indicatorsWithApproved / totalIndicators) * 100) : 0;

  const getDomainIcon = (code: string) => {
    switch (code) {
      case '1':
        return <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-moe-700" />;
      case '2':
        return <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-moe-700" />;
      case '3':
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-moe-700" />;
      case '4':
        return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-moe-700" />;
      default:
        return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-moe-700" />;
    }
  };

  const ministryLogoUrl = setting?.ministryLogoUrl || '/images/moe-logo.png';

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* القسم التعريفي الرئيسي (Hero Section) مع شعار وزارة التعليم المعتمد */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-slate-100/50 border-b border-slate-200/80 pt-8 sm:pt-12 pb-12 sm:pb-16 px-3 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* الشعار الرسمي لوزارة التعليم في مقدمة الواجهة الرئيسية */}
          <div className="flex justify-center mb-2 sm:mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 sm:p-4 bg-white rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
              <img
                src={ministryLogoUrl}
                alt="شعار وزارة التعليم بالمملكة العربية السعودية"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-moe-50 text-moe-900 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border border-moe-200 shadow-2xs max-w-full">
            <span className="w-2 h-2 rounded-full bg-moe-600 animate-pulse shrink-0" />
            <span className="truncate">وثيقة معايير التقويم والتصنيف والاعتماد المدرسي — الإصدار الثاني 2026م</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            شواهد التقويم الذاتي المدرسي
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            منصة توثيق وتنظيم الشواهد الرسمية المرتبطة بمعايير ومؤشرات التقويم المدرسي المعتمدة، مهيأة لاستعراض فريق التقويم والزوار والمعلمين.
          </p>

          {/* شريط البحث المباشر */}
          <div className="pt-2 w-full max-w-xl mx-auto">
            <SearchBar />
          </div>

          {/* بطاقة مؤشرات الإنجاز الإحصائية - متجاوبة 100% مع الجوال */}
          <div className="pt-4 max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-right">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 mb-3">
              <div className="space-y-0.5">
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">مستوى جاهزية الشواهد المعتمدة بالمدرسة</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  اكتمال الشواهد للمؤشرات ({indicatorsWithApproved} من {totalIndicators})
                </span>
              </div>
              <div className="self-end sm:self-center">
                <span className="text-2xl sm:text-3xl font-black text-moe-800 dir-ltr inline-block">
                  {overallCompletionRate}%
                </span>
              </div>
            </div>
            <ProgressBar
              value={overallCompletionRate}
              showPercentage={false}
              size="md"
              colorClass="bg-moe-700"
            />
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-500 pt-2.5 border-t border-slate-100">
              <span>* الإحصائية تخص الشواهد المعتمدة رسميًا فقط</span>
              <span>إجمالي الشواهد المعتمدة المتاحة: <strong className="text-slate-800 font-bold">{totalApprovedEvidences}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* قسم بطاقات المجالات الأربعة (Domains Section) */}
      <section id="domains-section" className="max-w-7xl mx-auto px-3 sm:px-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">مجالات التقويم المدرسي الرئيسية</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              اختر المجال لاستعراض المعايير والمؤشرات والشواهد المعتمدة المرتبطة به.
            </p>
          </div>
          <Link
            href="/about-evaluation"
            className="inline-flex items-center gap-1.5 text-xs text-moe-700 hover:text-moe-900 font-bold bg-moe-50 hover:bg-moe-100 px-3 py-2 rounded-xl border border-moe-200 transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>التعريف بأدوات التقويم الـ 12</span>
          </Link>
        </div>

        {/* شبكة المجالات الأربعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {domainStats.map((domain) => (
            <div
              key={domain.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between group"
            >
              <div>
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-moe-50 border border-moe-200/70 flex items-center justify-center shrink-0 group-hover:bg-moe-100/80 transition-colors">
                      {getDomainIcon(domain.code)}
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-moe-700 uppercase tracking-wider block">
                        المجال {domain.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-moe-900 transition-colors">
                        {domain.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {domain.totalStandards} معايير
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {domain.description}
                </p>

                {/* نسبة اكتمال الشواهد للمجال */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl sm:rounded-2xl border border-slate-100 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">اكتمال الشواهد:</span>
                    <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                      {domain.completedIndicators} من {domain.totalIndicators} مؤشر مكتمل
                    </span>
                  </div>
                  <ProgressBar
                    value={domain.completionRate}
                    showPercentage={true}
                    size="sm"
                    colorClass="bg-moe-700"
                  />
                </div>

                {/* قائمة مختصرة بالمعايير */}
                <div className="space-y-1.5 mb-5">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    المعايير المندرجة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {domain.standards.map((s) => (
                      <Link
                        key={s.id}
                        href={`/standards/${s.id}`}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span className="font-mono text-moe-700 font-bold">{s.code}</span>
                        <span className="truncate max-w-[140px] sm:max-w-none">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* زر الانتقال لصفحة المجال */}
              <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  إجمالي المؤشرات: <strong className="text-slate-800 font-bold">{domain.totalIndicators}</strong>
                </span>
                <Link
                  href={`/domains/${domain.id}`}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-moe-800 hover:text-moe-950 group-hover:translate-x-[-2px] transition-all bg-moe-50 hover:bg-moe-100 sm:bg-transparent sm:hover:bg-transparent py-1.5 sm:py-0 px-2 sm:px-0 rounded-lg"
                >
                  <span>استعراض المعايير والمؤشرات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* تنويه الشواهد للزائر وفريق التقويم الخارجي */}
      <section className="max-w-7xl mx-auto px-3 sm:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden border border-emerald-900">
          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 bg-emerald-900/90 text-emerald-200 text-xs px-3 py-1 rounded-full border border-emerald-800">
              <FileCheck2 className="w-4 h-4 text-emerald-300" />
              <span>إرشادات فريق التقويم الخارجي والزوار</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">بوابة عرض موحدة وسريعة الوصول</h3>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              جميع الشواهد المعروضة في هذه البوابة معتمدة رسميًا من إدارة المدرسة وتم ربطها مباشرة برموز المؤشرات. يمكنك الضغط على أي مؤشر لفتح روابط الملفات والمجلدات الموثقة مباشرة في تبويب جديد دون الحاجة لتسجيل الدخول.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>روابط HTTPS موثوقة ومحمية</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تحديث فوري عند اعتماد أي شاهد</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حماية الخصوصية ومنع عرض المسودات</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
