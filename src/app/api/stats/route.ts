import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// الإحصائيات تتغير مع كل اعتماد أو رفع شاهد — يمنع تخزينها كصفحة ثابتة وقت البناء.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const setting = await prisma.schoolSetting.findFirst();
    const isGov = setting ? setting.schoolType === 'government' : true;

    // الشرط: للمدارس الحكومية لا تحتسب المؤشرات الثلاثة الخاصة بالأهلية
    const indicatorWhere = isGov ? { appliesToGovernment: true } : {};

    const indicators = await prisma.indicator.findMany({
      where: indicatorWhere,
      include: {
        evidences: {
          select: {
            id: true,
            status: true,
          },
        },
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            domainId: true,
            domain: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalIndicators = indicators.length; // 49 للمدارس الحكومية
    let indicatorsWithApproved = 0;
    let pendingEvidencesCount = 0;
    let rejectedEvidencesCount = 0;
    let totalApprovedEvidences = 0;

    // إحصائيات المجالات
    const domainStatsMap: Record<
      string,
      {
        domainId: string;
        domainCode: string;
        domainName: string;
        totalIndicators: number;
        completedIndicators: number;
      }
    > = {};

    indicators.forEach((ind) => {
      const hasApproved = ind.evidences.some((e) => e.status === 'approved');
      if (hasApproved) {
        indicatorsWithApproved++;
      }

      ind.evidences.forEach((e) => {
        if (e.status === 'pending') pendingEvidencesCount++;
        else if (e.status === 'rejected') rejectedEvidencesCount++;
        else if (e.status === 'approved') totalApprovedEvidences++;
      });

      const domain = ind.standard.domain;
      if (!domainStatsMap[domain.id]) {
        domainStatsMap[domain.id] = {
          domainId: domain.id,
          domainCode: domain.code,
          domainName: domain.name,
          totalIndicators: 0,
          completedIndicators: 0,
        };
      }
      domainStatsMap[domain.id].totalIndicators++;
      if (hasApproved) {
        domainStatsMap[domain.id].completedIndicators++;
      }
    });

    const completionRate =
      totalIndicators > 0 ? Math.round((indicatorsWithApproved / totalIndicators) * 100) : 0;

    return NextResponse.json({
      schoolSetting: setting,
      totalIndicators,
      indicatorsWithApproved,
      indicatorsWithoutEvidence: totalIndicators - indicatorsWithApproved,
      pendingEvidencesCount,
      rejectedEvidencesCount,
      totalApprovedEvidences,
      completionRate,
      domains: Object.values(domainStatsMap).sort((a, b) =>
        a.domainCode.localeCompare(b.domainCode)
      ),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
