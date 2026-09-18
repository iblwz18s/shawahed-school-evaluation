import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const setting = await prisma.schoolSetting.findFirst();
    const isGov = setting ? setting.schoolType === 'government' : true;

    // البحث في المؤشرات
    const indicators = await prisma.indicator.findMany({
      where: {
        ...(isGov ? { appliesToGovernment: true } : {}),
        OR: [
          { code: { contains: q } },
          { text: { contains: q } },
          { standard: { name: { contains: q } } },
          { standard: { domain: { name: { contains: q } } } },
        ],
      },
      include: {
        standard: {
          include: {
            domain: true,
          },
        },
        evidences: {
          where: { status: 'approved' },
          select: { id: true },
        },
      },
      take: 25,
    });

    const results = indicators.map((ind) => ({
      id: ind.id,
      code: ind.code,
      text: ind.text,
      standardName: ind.standard.name,
      domainName: ind.standard.domain.name,
      approvedEvidencesCount: ind.evidences.length,
      hasApproved: ind.evidences.length > 0,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'خطأ في عملية البحث' }, { status: 500 });
  }
}
