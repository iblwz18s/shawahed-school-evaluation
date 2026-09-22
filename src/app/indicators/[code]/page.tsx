import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUserFresh } from '@/lib/auth';
import { IndicatorClientView } from './IndicatorClientView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { code: string };
}

export default async function IndicatorPage({ params }: PageProps) {
  const decodedCode = decodeURIComponent(params.code);
  const currentUser = await getCurrentUserFresh();

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
    notFound();
  }

  // فلترة الشواهد حسب المستخدم:
  // الزائر: الشواهد المعتمدة فقط (approved)
  // المعلم: الشواهد المعتمدة + شواهده المعلقة أو المرفوضة
  // المدير: جميع الشواهد
  let evidenceWhere: any = { indicatorId: indicator.id };
  if (!currentUser) {
    evidenceWhere.status = 'approved';
  } else if (currentUser.role === 'teacher') {
    evidenceWhere.OR = [
      { status: 'approved' },
      { submittedById: currentUser.id },
    ];
  }

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

  const serializedEvidences = evidences.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    reviewedAt: e.reviewedAt ? e.reviewedAt.toISOString() : null,
  }));

  return (
    <IndicatorClientView
      indicator={indicator}
      evidences={serializedEvidences as any}
      currentUser={currentUser}
    />
  );
}
