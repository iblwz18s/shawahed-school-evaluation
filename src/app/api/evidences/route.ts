import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { formatAcademicYearOnly } from '@/lib/hijri-date';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const { searchParams } = new URL(req.url);

    const indicatorId = searchParams.get('indicatorId');
    const indicatorCode = searchParams.get('indicatorCode');
    const status = searchParams.get('status');
    const domainId = searchParams.get('domainId');
    const standardId = searchParams.get('standardId');
    const my = searchParams.get('my') === 'true';

    // قواعد الأمان والصلاحيات:
    // إذا لم يكن مسجل دخول: يعرض فقط الشواهد المعتمدة
    if (!session) {
      const evidences = await prisma.evidence.findMany({
        where: {
          status: 'approved',
          ...(indicatorId ? { indicatorId } : {}),
          ...(indicatorCode ? { indicator: { code: indicatorCode } } : {}),
        },
        include: {
          indicator: {
            include: {
              standard: {
                include: { domain: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ evidences });
    }

    // إذا كان معلم:
    if (session.role === 'teacher') {
      const whereClause: any = {
        ...(indicatorId ? { indicatorId } : {}),
        ...(indicatorCode ? { indicator: { code: indicatorCode } } : {}),
      };

      if (my) {
        whereClause.submittedById = session.id;
        if (status) whereClause.status = status;
      } else {
        // إذا طلب شواهد عامة لمؤشر، يرى المعتمدة فقط + شواهده هو
        whereClause.OR = [
          { status: 'approved' },
          { submittedById: session.id },
        ];
      }

      const evidences = await prisma.evidence.findMany({
        where: whereClause,
        include: {
          submittedBy: {
            select: { id: true, name: true, email: true },
          },
          reviewedBy: {
            select: { id: true, name: true },
          },
          indicator: {
            include: {
              standard: {
                include: { domain: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ evidences });
    }

    // إذا كان مديراً: يرى جميع الشواهد مع الفلاتر
    const adminWhere: any = {};
    if (status && status !== 'all') {
      adminWhere.status = status;
    }
    if (indicatorId) adminWhere.indicatorId = indicatorId;
    if (indicatorCode) adminWhere.indicator = { code: indicatorCode };
    if (standardId) adminWhere.indicator = { ...adminWhere.indicator, standardId };
    if (domainId) adminWhere.indicator = { ...adminWhere.indicator, standard: { domainId } };

    const evidences = await prisma.evidence.findMany({
      where: adminWhere,
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
        indicator: {
          include: {
            standard: {
              include: { domain: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ evidences });
  } catch (error) {
    console.error('Fetch evidences error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشواهد' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإضافة شاهد' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      indicatorId,
      title,
      evidenceType = 'external_link',
      subType,
      url,
      description,
      academicYear,
      semester,
      reportData,
      pdfUrl,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'اسم الشاهد حقل إلزامي' },
        { status: 400 }
      );
    }

    let finalUrl = url ? url.trim() : null;

    if (evidenceType === 'external_link') {
      if (!finalUrl) {
        return NextResponse.json(
          { error: 'رابط الشاهد حقل إلزامي' },
          { status: 400 }
        );
      }
      if (!finalUrl.toLowerCase().startsWith('https://')) {
        return NextResponse.json(
          { error: 'أدخل رابطًا صالحًا يبدأ بـ https://' },
          { status: 400 }
        );
      }
    } else if (evidenceType === 'report') {
      if (!reportData) {
        return NextResponse.json(
          { error: 'بيانات التقرير مطلوبة' },
          { status: 400 }
        );
      }
      if (!finalUrl && pdfUrl) {
        finalUrl = pdfUrl;
      }
    }

    const indicator = await prisma.indicator.findUnique({
      where: { id: indicatorId },
    });

    if (!indicator) {
      return NextResponse.json(
        { error: 'المؤشر المحدد غير موجود' },
        { status: 404 }
      );
    }

    const setting = await prisma.schoolSetting.findFirst();
    const currentAcademicYear = formatAcademicYearOnly(academicYear || setting?.academicYear);

    const serializedReportData =
      typeof reportData === 'object' ? JSON.stringify(reportData) : reportData || null;

    // إنشاء الشاهد بحالة pending
    const evidence = await prisma.evidence.create({
      data: {
        indicatorId,
        title: title.trim(),
        evidenceType,
        subType: subType || (evidenceType === 'report' ? 'program_activity' : 'other'),
        url: finalUrl,
        reportData: serializedReportData,
        pdfUrl: pdfUrl || null,
        description: description?.trim() || null,
        academicYear: currentAcademicYear,
        semester: semester?.trim() || 'الفصل الدراسي الأول',
        submittedById: session.id,
        status: 'pending',
      },
      include: {
        indicator: true,
      },
    });

    // تسجيل العملية في AuditLog
    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'SUBMIT_EVIDENCE',
      entityType: 'evidence',
      entityId: evidence.id,
      metadata: {
        title: evidence.title,
        evidenceType: evidence.evidenceType,
        indicatorCode: indicator.code,
        url: evidence.url || evidence.pdfUrl,
      },
    });

    return NextResponse.json({
      message: 'تم إرسال الشاهد للمراجعة بنجاح.',
      evidence,
    });
  } catch (error) {
    console.error('Create evidence error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء حفظ الشاهد' },
      { status: 500 }
    );
  }
}
