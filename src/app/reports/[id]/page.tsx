import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateReportHtml } from '@/lib/report-html';
import { Download, ArrowLeft, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function ReportViewPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();

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
    ministryLogoUrl: setting?.ministryLogoUrl || '/images/moe-logo.png',
    schoolStamp: (setting as any)?.schoolStampUrl || null,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* شريط الإجراءات والمسار */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-moe-800">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
          <Link
            href={`/indicators/${encodeURIComponent(evidence.indicator.code)}`}
            className="hover:text-moe-800 font-mono dir-ltr inline-block font-bold"
          >
            {evidence.indicator.code}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{evidence.title}</span>
        </nav>

        <div className="flex items-center gap-3">
          <StatusBadge status={evidence.status} />

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

      {/* عرض التقرير المنسق داخل حاوية A4 الرسمية */}
      <div className="bg-slate-100 p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-inner flex justify-center overflow-x-auto">
        <div className="w-full max-w-[210mm] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 sm:p-6 min-h-[297mm]">
          <iframe
            srcDoc={htmlContent}
            title={evidence.title}
            className="w-full min-h-[1100px] border-0 rounded-xl bg-white"
          />
        </div>
      </div>
    </div>
  );
}
