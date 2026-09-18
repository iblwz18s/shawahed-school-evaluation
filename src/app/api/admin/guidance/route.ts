import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { indicatorId, schoolGuidance } = await req.json();

    if (!indicatorId) {
      return NextResponse.json({ error: 'معرف المؤشر مطلوب' }, { status: 400 });
    }

    const updated = await prisma.indicator.update({
      where: { id: indicatorId },
      data: {
        schoolGuidance: schoolGuidance?.trim() || null,
      },
    });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'UPDATE_GUIDANCE',
      entityType: 'indicator',
      entityId: updated.id,
      metadata: { code: updated.code, guidance: updated.schoolGuidance },
    });

    return NextResponse.json({
      message: 'تم تحديث إرشادات المدرسة للمؤشر بنجاح',
      indicator: updated,
    });
  } catch (error) {
    console.error('Update guidance error:', error);
    return NextResponse.json({ error: 'خطأ أثناء تحديث الإرشادات' }, { status: 500 });
  }
}
