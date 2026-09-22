import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { UserSession } from '@/types';
import { prisma } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || 'shawahed-secret-key-2026-saudi-evaluation-secure';
const key = new TextEncoder().encode(SECRET_KEY);
export const COOKIE_NAME = 'shawahed_session';

export async function createSessionToken(user: UserSession): Promise<string> {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'teacher',
      isActive: payload.isActive as boolean,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * جلسة محدّثة من قاعدة البيانات.
 * التوكن يحمل الاسم وقت تسجيل الدخول، فإن تغيّر الاسم لاحقاً (كما في إعادة
 * تسمية الحسابات) تظل الجلسة القديمة تحمل الاسم السابق — لذلك نقرأ المستخدم
 * من القاعدة عند عرض صفحات تُظهر اسمه (مثل منفّذ التقرير).
 */
export async function getCurrentUserFresh(): Promise<UserSession | null> {
  const session = await getCurrentUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return null;
  return user as UserSession;
}
