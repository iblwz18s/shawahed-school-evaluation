import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { COOKIE_NAME, createSessionToken } from '@/lib/auth';
import { STAFF_LOGIN_DOMAIN } from '@/lib/staff-accounts';

/**
 * يبحث عن المستخدم باسم دخول مرن:
 *  - بريد كامل: Os@saad.sa
 *  - اسم مختصر: Os  ← يُطابق os@saad.sa ثم أي بريد يبدأ بـ os@
 */
async function resolveUserByIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase();
  if (!value) return null;

  if (value.includes('@')) {
    return prisma.user.findFirst({
      where: { email: { equals: value, mode: 'insensitive' } },
    });
  }

  const domain = STAFF_LOGIN_DOMAIN.toLowerCase();

  return (
    (await prisma.user.findFirst({
      where: { email: { equals: `${value}@${domain}`, mode: 'insensitive' } },
    })) ??
    (await prisma.user.findFirst({
      where: { email: { startsWith: `${value}@`, mode: 'insensitive' } },
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'الرجاء إدخال اسم الدخول وكلمة المرور' },
        { status: 400 }
      );
    }

    const user = await resolveUserByIdentifier(String(email));

    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'تم تعطيل هذا الحساب. يرجى مراجعة إدارة المدرسة' },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'teacher',
      isActive: user.isActive,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
