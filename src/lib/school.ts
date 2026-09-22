import { prisma } from '@/lib/db';

/**
 * اسم مدير المدرسة الذي يظهر في توقيع التقارير.
 *
 * لا يوجد حقل مستقل للمدير في إعدادات المدرسة، فيُؤخذ من حساب المدير
 * (role = admin) الأقدم في القاعدة — وهو نفسه المسؤول عن اعتماد الشواهد.
 * يمكن تجاوزه بمتغيّر البيئة SCHOOL_PRINCIPAL_NAME عند الحاجة.
 */
export async function getSchoolPrincipalName(): Promise<string> {
  const override = (process.env.SCHOOL_PRINCIPAL_NAME || '').trim();
  if (override) return override;

  const admin = await prisma.user.findFirst({
    where: { role: 'admin', isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });

  return admin?.name || '';
}
