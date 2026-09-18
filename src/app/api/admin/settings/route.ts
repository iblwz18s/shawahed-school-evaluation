import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    let setting = await prisma.schoolSetting.findFirst();
    if (!setting) {
      setting = await prisma.schoolSetting.create({
        data: {
          schoolName: 'ثانوية رواد المعرفة',
          educationDepartment: 'الإدارة العامة للتعليم بمنطقة الرياض',
          academicYear: '1447-1448هـ / 2026م',
          schoolType: 'government',
          publicPortalEnabled: true,
        },
      });
    }
    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'خطأ أثناء جلب إعدادات المدرسة' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const {
      schoolName,
      educationDepartment,
      academicYear,
      schoolType,
      publicPortalEnabled,
    } = await req.json();

    const current = await prisma.schoolSetting.findFirst();

    const updated = current
      ? await prisma.schoolSetting.update({
          where: { id: current.id },
          data: {
            ...(schoolName ? { schoolName: schoolName.trim() } : {}),
            ...(educationDepartment ? { educationDepartment: educationDepartment.trim() } : {}),
            ...(academicYear ? { academicYear: academicYear.trim() } : {}),
            ...(schoolType ? { schoolType } : {}),
            ...(typeof publicPortalEnabled === 'boolean' ? { publicPortalEnabled } : {}),
          },
        })
      : await prisma.schoolSetting.create({
          data: {
            schoolName: schoolName || 'ثانوية رواد المعرفة',
            educationDepartment: educationDepartment || 'الإدارة العامة للتعليم',
            academicYear: academicYear || '1447-1448هـ / 2026م',
            schoolType: schoolType || 'government',
            publicPortalEnabled: publicPortalEnabled ?? true,
          },
        });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'UPDATE_SETTINGS',
      entityType: 'settings',
      entityId: updated.id,
      metadata: { schoolName: updated.schoolName, academicYear: updated.academicYear },
    });

    return NextResponse.json({
      message: 'تم حفظ إعدادات المدرسة بنجاح',
      setting: updated,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'خطأ أثناء حفظ الإعدادات' }, { status: 500 });
  }
}
