import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCurrentUserFresh } from '@/lib/auth';
import { SearchBar } from '@/components/search/SearchBar';
import { ReadinessCard } from '@/components/common/ReadinessCard';
import { DomainsExplorer } from '@/components/domains/DomainsExplorer';
import {
  Building2,
  GraduationCap,
  Award,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  TrendingUp,
  UserCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const currentUser = await getCurrentUserFresh();
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

    // تجهيز المعايير مع مؤشراتها الفرعية لعرضها داخل أكورديون البطاقة
    const standardsData = domain.standards.map((std) => {
      const indicatorsData = std.indicators.map((ind) => ({
        id: ind.id,
        code: ind.code,
        text: ind.text,
        approvedEvidencesCount: ind.evidences.length,
      }));

      const indicatorsCount = indicatorsData.length;
      const completedCount = indicatorsData.filter(
        (ind) => ind.approvedEvidencesCount > 0
      ).length;

      return {
        id: std.id,
        code: std.code,
        name: std.name,
        indicatorsCount,
        completedCount,
        completionRate:
          indicatorsCount > 0 ? Math.round((completedCount / indicatorsCount) * 100) : 0,
        indicators: indicatorsData,
      };
    });

    return {
      id: domain.id,
      code: domain.code,
      name: domain.name,
      description: domain.description,
      totalStandards: domain.standards.length,
      totalIndicators: domainTotalIndicators,
      completedIndicators: domainCompletedIndicators,
      completionRate,
      standards: standardsData,
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
      {/* ترحيب بالمستخدم المسجّل باسمه الحالي مع اختصار الوصول إلى لوحته */}
      {currentUser && (
        <section className="max-w-7xl mx-auto px-3 sm:px-8">
          <div className="bg-gradient-to-l from-moe-800 to-moe-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border border-moe-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <UserCircle2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm sm:text-base font-black">أهلاً بك، {currentUser.name}</p>
                <p className="text-[11px] sm:text-xs text-emerald-100/85 leading-relaxed">
                  {currentUser.role === 'admin'
                    ? 'داخل بحساب مدير المدرسة — يمكنك اعتماد الشواهد ومتابعة الكادر التعليمي.'
                    : 'اسمك يظهر تلقائياً في خانة المنفذ بكل تقرير تنشئه، ويمكنك متابعة شواهدك من لوحتك.'}
                </p>
              </div>
            </div>
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/staff'}
              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-moe-900 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0 shadow-xs"
            >
              <span>{currentUser.role === 'admin' ? 'لوحة تحكم المدير' : 'لوحة المعلم'}</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* القسم التعريفي الرئيسي (Hero Section) مع شعار وزارة التعليم المعتمد */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200 pt-8 sm:pt-12 pb-12 sm:pb-16 px-3 sm:px-8 text-center">
        {/* خلفية الهيرو المتموجة بتدرج وشفافية 50% */}
        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/images/hero-bg.png"
            alt=""
            className="w-full h-full object-cover object-bottom opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-slate-50/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* الشعار الرسمي لوزارة التعليم في مقدمة الواجهة الرئيسية */}
          <div className="flex justify-center mb-2 sm:mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3.5 sm:p-4 bg-white rounded-3xl shadow-md border-2 border-slate-200 hover:border-moe-400 transition-all">
              <img
                src={ministryLogoUrl}
                alt="شعار وزارة التعليم بالمملكة العربية السعودية"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            شواهد التقويم الذاتي المدرسي
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed px-2 font-medium">
            منصة توثيق وتنظيم الشواهد الرسمية المرتبطة بمعايير ومؤشرات التقويم المدرسي المعتمدة، مهيأة لاستعراض فريق التقويم والزوار والمعلمين.
          </p>

          {/* شريط البحث المباشر */}
          <div className="pt-2 w-full max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* قسم بطاقات المجالات الأربعة (Domains Section) */}
      <section id="domains-section" className="max-w-7xl mx-auto px-3 sm:px-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">مجالات التقويم المدرسي الرئيسية</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              اختر المجال لاستعراض المعايير والمؤشرات والشواهد المعتمدة المرتبطة به.
            </p>
          </div>
          <Link
            href="/about-evaluation"
            className="inline-flex items-center gap-2 text-xs text-moe-900 hover:text-moe-950 font-bold bg-white hover:bg-moe-50 px-4 py-2.5 rounded-xl border-2 border-moe-300 hover:border-moe-500 transition-all self-start sm:self-auto shrink-0 shadow-xs hover:shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-moe-700" />
            <span>التعريف بأدوات التقويم الـ 12</span>
          </Link>
        </div>

        {/* أزرار المجالات الأربعة — الضغط على أي زر يفتح بطاقة المجال كاملة بأنيميشن ناعم */}
        <DomainsExplorer
          items={domainStats.map((domain) => ({
            domain,
            icon: getDomainIcon(domain.code),
          }))}
        />

        {/* ملخّص مستوى الجاهزية — أسفل أزرار المجالات */}
        <ReadinessCard
          rate={overallCompletionRate}
          completed={indicatorsWithApproved}
          total={totalIndicators}
          approvedEvidencesCount={totalApprovedEvidences}
        />
      </section>
    </div>
  );
}
