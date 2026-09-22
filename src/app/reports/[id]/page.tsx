import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUserFresh } from '@/lib/auth';
import { getSchoolPrincipalName } from '@/lib/school';
import { generateReportHtml } from '@/lib/report-html';
import { Download, ArrowLeft, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { ReportPrintButton } from '@/components/evidence/ReportPrintButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function ReportViewPage({ params }: PageProps) {
  const currentUser = await getCurrentUserFresh();

  const evidence = await prisma.evidence.findUnique({
    where: { id: params.id },
    include: {
      indicator: {
        include: {
          standard: {
            include: {
              domain: true,
            },
          },
        },
      },
      submittedBy: {
        select: { id: true, name: true },
      },
    },
  });

  if (!evidence || evidence.evidenceType !== 'report' || !evidence.reportData) {
    notFound();
  }

  // قواعد الصلاحيات: الزائر يرى فقط المعتمد
  if (!currentUser && evidence.status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-800">هذا التقرير غير متاح للعرض العام</h1>
        <p className="text-xs text-slate-500">التقرير ما زال قيد المراجعة أو غير معتمد من إدارة المدرسة.</p>
        <Link href="/" className="inline-block text-xs text-moe-800 font-bold hover:underline">
          ← العودة للرئيسية
        </Link>
      </div>
    );
  }

  const setting = await prisma.schoolSetting.findFirst();
  const reportData = JSON.parse(evidence.reportData);

  const htmlContent = generateReportHtml({
    reportData,
    indicatorCode: evidence.indicator.code,
    indicatorText: evidence.indicator.text,
    schoolName: setting?.schoolName || 'ابتدائية سعد بن أبي وقاص',
    educationDepartment: setting?.educationDepartment || 'إدارة التعليم بمنطقة الحدود الشمالية',
    academicYear: evidence.academicYear,
    schoolPrincipal: await getSchoolPrincipalName(),
    ministryLogoUrl: setting?.ministryLogoUrl || '/images/moe-logo.png',
    schoolStamp: (setting as any)?.schoolStampUrl || null,
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* شريط الإجراءات والمسار */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-moe-800">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
          <Link
            href={`/indicators/${encodeURIComponent(evidence.indicator.code)}`}
            className="hover:text-moe-800 font-mono dir-ltr inline-block font-bold shrink-0"
          >
            {evidence.indicator.code}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-[180px] sm:max-w-xs">{evidence.title}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <StatusBadge status={evidence.status} />

          <ReportPrintButton />

          {evidence.pdfUrl && (
            <a
              href={evidence.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* عرض التقرير المنسق داخل حاوية A4 الرسمية بمقاس 210mm ثابت دون أي ضغط */}
      <div className="bg-slate-200/80 p-2 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto">
        <iframe
          srcDoc={htmlContent}
          title={evidence.title}
          className="w-[794px] min-w-[794px] min-h-[1150px] bg-white rounded-xl shadow-2xl border border-slate-300 block shrink-0"
        />
      </div>
    </div>
  );
}
