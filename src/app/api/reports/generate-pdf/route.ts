import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateReportHtml } from '@/lib/report-html';
import { generatePdfFromHtml } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const { reportData, indicatorCode, indicatorText } = await req.json();

    if (!reportData || !reportData.title) {
      return NextResponse.json({ error: 'بيانات التقرير غير مكتملة' }, { status: 400 });
    }

    const setting = await prisma.schoolSetting.findFirst();

    // استخراج أصل الرابط
    const origin = req.nextUrl.origin;

    const htmlContent = generateReportHtml({
      reportData,
      indicatorCode,
      indicatorText,
      schoolName: setting?.schoolName || 'ابتدائية سعد بن أبي وقاص',
      educationDepartment: setting?.educationDepartment || 'إدارة التعليم بمنطقة الحدود الشمالية',
      academicYear: setting?.academicYear || '1447-1448هـ / 2026م',
      baseUrl: origin,
      ministryLogoUrl: setting?.ministryLogoUrl || '/images/moe-logo.png',
      schoolStamp: (setting as any)?.schoolStampUrl || null,
    });

    // توليد PDF عبر Playwright
    const pdfResult = await generatePdfFromHtml(htmlContent, {
      filenamePrefix: `report_${reportData.type === 'نشاط' ? 'activity' : 'program'}`,
    });

    return NextResponse.json({
      success: true,
      pdfUrl: pdfResult.relativeUrl,
      size: pdfResult.size,
    });
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    return NextResponse.json({ error: error?.message || 'فشل في توليد ملف الـ PDF' }, { status: 500 });
  }
}
