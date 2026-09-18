import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { submittedEvidences: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'خطأ أثناء جلب المستخدمين' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والبريد وكلمة المرور حقول مطلوبة' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'teacher';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: userRole,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: newUser.id,
      metadata: { name: newUser.name, email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({
      message: 'تم إنشاء المستخدم بنجاح',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'خطأ أثناء إنشاء المستخدم' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id, isActive, role, name } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(role ? { role } : {}),
        ...(name ? { name } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await recordAuditLog({
      userId: session.id,
      userName: session.name,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: user.id,
      metadata: { name: user.name, isActive: user.isActive, role: user.role },
    });

    return NextResponse.json({
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'خطأ أثناء تحديث المستخدم' }, { status: 500 });
  }
}
