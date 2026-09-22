import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReportHtml } from '@/lib/report-html';
import { getSchoolPrincipalName } from '@/lib/school';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { reportData, indicatorCode, indicatorText } = await req.json();

    if (!reportData) {
      return NextResponse.json({ error: 'بيانات التقرير مفقودة' }, { status: 400 });
    }

    const setting = await prisma.schoolSetting.findFirst();
    const origin = req.nextUrl.origin;

    const html = generateReportHtml({
      reportData,
      indicatorCode,
      indicatorText,
      schoolName: setting?.schoolName || 'ابتدائية سعد بن أبي وقاص',
      educationDepartment: setting?.educationDepartment || 'إدارة التعليم بمنطقة الحدود الشمالية',
      academicYear: setting?.academicYear || '1447-1448هـ / 2026م',
      baseUrl: origin,
      schoolPrincipal: await getSchoolPrincipalName(),
      ministryLogoUrl: setting?.ministryLogoUrl || '/images/moe-logo.png',
      schoolStamp: (setting as any)?.schoolStampUrl || null,
    });

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المعاينة' }, { status: 500 });
  }
}
