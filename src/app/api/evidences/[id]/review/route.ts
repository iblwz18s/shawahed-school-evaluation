import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح. صلاحية مدير المدرسة مطلوبة' },
        { status: 403 }
      );
    }

    const { action, rejectionReason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'الإجراء غير صالح. يجب أن يكون اعتماد أو رفض' },
        { status: 400 }
      );
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { indicator: true, submittedBy: true },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'الشاهد غير موجود' }, { status: 404 });
    }

    if (action === 'reject' && (!rejectionReason || !rejectionReason.trim())) {
      return NextResponse.json(
        { error: 'سبب الرفض إلزامي عند رفض الشاهد' },
        { status: 400 }
      );
    }

    const isApprove = action === 'approve';

    const updated = await prisma.evidence.update({
      where: { id: params.id },
      data: {
        status: isApprove ? 'approved' : 'rejected',
        rejectionReason: isApprove ? null : rejectionReason.trim(),
        reviewedById: session.id,
        reviewedAt: new Date(),
      },
    });

    // تسجيل في سجل التدقيق
    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: isApprove ? 'APPROVE_EVIDENCE' : 'REJECT_EVIDENCE',
      entityType: 'evidence',
      entityId: updated.id,
      metadata: {
        title: updated.title,
        indicatorCode: evidence.indicator.code,
        teacherName: evidence.submittedBy.name,
        reason: isApprove ? null : rejectionReason.trim(),
      },
    });

    const successMessage = isApprove
      ? 'تم اعتماد الشاهد وأصبح ظاهرًا في واجهة الزوار.'
      : 'تم رفض الشاهد وإعادته لصاحبه مع الملاحظة.';

    return NextResponse.json({
      success: true,
      message: successMessage,
      evidence: updated,
    });
  } catch (error) {
    console.error('Review evidence error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الشاهد' },
      { status: 500 }
    );
  }
}
