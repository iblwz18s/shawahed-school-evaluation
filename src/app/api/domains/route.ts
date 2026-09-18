import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const setting = await prisma.schoolSetting.findFirst();
    const isGov = setting ? setting.schoolType === 'government' : true;

    const domains = await prisma.domain.findMany({
      orderBy: { sortOrder: 'asc' },
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

    const result = domains.map((domain) => {
      let totalIndicators = 0;
      let completedIndicators = 0;

      const formattedStandards = domain.standards.map((std) => {
        const stdIndicatorsCount = std.indicators.length;
        const stdCompletedCount = std.indicators.filter((ind) => ind.evidences.length > 0).length;

        totalIndicators += stdIndicatorsCount;
        completedIndicators += stdCompletedCount;

        return {
          id: std.id,
          code: std.code,
          name: std.name,
          description: std.description,
          indicatorsCount: stdIndicatorsCount,
          completedCount: stdCompletedCount,
          completionRate:
            stdIndicatorsCount > 0
              ? Math.round((stdCompletedCount / stdIndicatorsCount) * 100)
              : 0,
        };
      });

      return {
        id: domain.id,
        code: domain.code,
        name: domain.name,
        description: domain.description,
        iconName: domain.iconName,
        totalStandards: domain.standards.length,
        totalIndicators,
        completedIndicators,
        completionRate:
          totalIndicators > 0
            ? Math.round((completedIndicators / totalIndicators) * 100)
            : 0,
        standards: formattedStandards,
      };
    });

    return NextResponse.json({ domains: result });
  } catch (error) {
    console.error('Fetch domains error:', error);
    return NextResponse.json({ error: 'خطأ أثناء جلب المجالات' }, { status: 500 });
  }
}
