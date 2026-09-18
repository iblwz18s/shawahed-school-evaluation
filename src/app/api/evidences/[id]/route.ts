import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
        indicator: {
          include: {
            standard: {
              include: { domain: true },
            },
          },
        },
      },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'الشاهد غير موجود' }, { status: 404 });
    }

    // إذا كان زائرًا والشاهد غير معتمد: ممنوع
    if (!session && evidence.status !== 'approved') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 });
    }

    // إذا كان معلمًا وليس صاحب الشاهد والشاهد غير معتمد: ممنوع
    if (
      session &&
      session.role === 'teacher' &&
      evidence.submittedById !== session.id &&
      evidence.status !== 'approved'
    ) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 });
    }

    return NextResponse.json({ evidence });
  } catch (error) {
    console.error('Get single evidence error:', error);
    return NextResponse.json({ error: 'خطأ أثناء جلب الشاهد' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { indicator: true },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'الشاهد غير موجود' }, { status: 404 });
    }

    // تحقق من الصلاحيات:
    // المعلم يستطيع تعديل شواهده غير المعتمدة فقط
    if (session.role === 'teacher') {
      if (evidence.submittedById !== session.id) {
        return NextResponse.json(
          { error: 'لا يمكنك تعديل شاهد خاص بمعلم آخر' },
          { status: 403 }
        );
      }
      if (evidence.status === 'approved') {
        return NextResponse.json(
          { error: 'لا يمكن تعديل شاهد تم اعتماده مسبقاً' },
          { status: 400 }
        );
      }
    }

    const { title, url, description, academicYear, semester, reportData, pdfUrl, subType } = await req.json();

    if (url && !url.trim().toLowerCase().startsWith('https://') && !url.trim().startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'أدخل رابطًا صالحًا يبدأ بـ https://' },
        { status: 400 }
      );
    }

    // إذا كان المعلم يعدل شاهدًا مرفوضًا أو معلقًا، تعاد الحالة إلى pending
    const statusUpdate =
      session.role === 'teacher' ? { status: 'pending', rejectionReason: null } : {};

    const serializedReportData =
      reportData !== undefined
        ? typeof reportData === 'object'
          ? JSON.stringify(reportData)
          : reportData
        : undefined;

    const updated = await prisma.evidence.update({
      where: { id: params.id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(url !== undefined ? { url: url ? url.trim() : null } : {}),
        ...(subType !== undefined ? { subType } : {}),
        ...(serializedReportData !== undefined ? { reportData: serializedReportData } : {}),
        ...(pdfUrl !== undefined ? { pdfUrl } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(academicYear ? { academicYear: academicYear.trim() } : {}),
        ...(semester !== undefined ? { semester: semester?.trim() || null } : {}),
        ...statusUpdate,
      },
    });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'EDIT_EVIDENCE',
      entityType: 'evidence',
      entityId: updated.id,
      metadata: {
        title: updated.title,
        status: updated.status,
        indicatorCode: evidence.indicator.code,
      },
    });

    return NextResponse.json({
      message: 'تم تعديل الشاهد بنجاح وإعادته للمراجعة',
      evidence: updated,
    });
  } catch (error) {
    console.error('Update evidence error:', error);
    return NextResponse.json({ error: 'خطأ أثناء تعديل الشاهد' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { indicator: true },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'الشاهد غير موجود' }, { status: 404 });
    }

    // المعلم يستطيع حذف شواهده غير المعتمدة فقط
    if (session.role === 'teacher') {
      if (evidence.submittedById !== session.id) {
        return NextResponse.json(
          { error: 'غير مصرح لك بحذف هذا الشاهد' },
          { status: 403 }
        );
      }
      if (evidence.status === 'approved') {
        return NextResponse.json(
          { error: 'لا يمكن حذف شاهد معتمد' },
          { status: 400 }
        );
      }
    }

    await prisma.evidence.delete({
      where: { id: params.id },
    });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'DELETE_EVIDENCE',
      entityType: 'evidence',
      entityId: params.id,
      metadata: {
        title: evidence.title,
        indicatorCode: evidence.indicator.code,
      },
    });

    return NextResponse.json({ success: true, message: 'تم حذف الشاهد بنجاح' });
  } catch (error) {
    console.error('Delete evidence error:', error);
    return NextResponse.json({ error: 'خطأ أثناء حذف الشاهد' }, { status: 500 });
  }
}
