import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    const decodedCode = decodeURIComponent(params.code);

    const indicator = await prisma.indicator.findFirst({
      where: {
        OR: [{ code: decodedCode }, { id: decodedCode }],
      },
      include: {
        standard: {
          include: {
            domain: true,
          },
        },
      },
    });

    if (!indicator) {
      return NextResponse.json({ error: 'المؤشر غير موجود' }, { status: 404 });
    }

    // شروط عرض الشواهد حسب الصلاحية:
    // للزائر: المعتمدة فقط
    // للمعلم: المعتمدة + شواهده
    // للمدير: كل الشواهد
    let evidenceWhere: any = { indicatorId: indicator.id };
    if (!session) {
      evidenceWhere.status = 'approved';
    } else if (session.role === 'teacher') {
      evidenceWhere.OR = [
        { status: 'approved' },
        { submittedById: session.id },
      ];
    }
    // if admin, no extra status filter

    const evidences = await prisma.evidence.findMany({
      where: evidenceWhere,
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      indicator,
      evidences,
      userRole: session?.role || 'visitor',
      currentUserId: session?.id || null,
    });
  } catch (error) {
    console.error('Fetch indicator error:', error);
    return NextResponse.json({ error: 'خطأ أثناء جلب المؤشر' }, { status: 500 });
  }
}
