const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync('prisma/sqlite_dump.json', 'utf-8');
  const data = JSON.parse(raw);

  console.log('Clearing existing data if any...');
  await prisma.auditLog.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.schoolSetting.deleteMany({});
  await prisma.indicator.deleteMany({});
  await prisma.standard.deleteMany({});
  await prisma.domain.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Importing Users (' + (data.User || []).length + ')...');
  await prisma.user.createMany({
    data: (data.User || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role,
      isActive: Boolean(u.isActive),
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    }))
  });

  console.log('Importing Domains (' + (data.Domain || []).length + ')...');
  await prisma.domain.createMany({
    data: (data.Domain || []).map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      description: d.description,
      sortOrder: d.sortOrder,
      iconName: d.iconName,
    }))
  });

  console.log('Importing Standards (' + (data.Standard || []).length + ')...');
  await prisma.standard.createMany({
    data: (data.Standard || []).map(s => ({
      id: s.id,
      domainId: s.domainId,
      code: s.code,
      name: s.name,
      description: s.description,
      sortOrder: s.sortOrder,
    }))
  });

  console.log('Importing Indicators (' + (data.Indicator || []).length + ')...');
  await prisma.indicator.createMany({
    data: (data.Indicator || []).map(i => ({
      id: i.id,
      standardId: i.standardId,
      code: i.code,
      text: i.text,
      appliesToGovernment: Boolean(i.appliesToGovernment),
      appliesToPrivate: Boolean(i.appliesToPrivate),
      schoolGuidance: i.schoolGuidance,
      sortOrder: i.sortOrder,
      isActive: Boolean(i.isActive),
    }))
  });

  console.log('Importing SchoolSetting (' + (data.SchoolSetting || []).length + ')...');
  if (data.SchoolSetting && data.SchoolSetting.length > 0) {
    await prisma.schoolSetting.createMany({
      data: data.SchoolSetting.map(ss => ({
        id: ss.id,
        schoolName: ss.schoolName,
        educationDepartment: ss.educationDepartment,
        schoolLogoUrl: ss.schoolLogoUrl,
        ministryLogoUrl: ss.ministryLogoUrl,
        academicYear: ss.academicYear,
        schoolType: ss.schoolType,
        publicPortalEnabled: Boolean(ss.publicPortalEnabled),
        createdAt: new Date(ss.createdAt),
        updatedAt: new Date(ss.updatedAt),
      }))
    });
  }

  console.log('Importing Evidences (' + (data.Evidence || []).length + ')...');
  if (data.Evidence && data.Evidence.length > 0) {
    await prisma.evidence.createMany({
      data: data.Evidence.map(ev => ({
        id: ev.id,
        indicatorId: ev.indicatorId,
        title: ev.title,
        evidenceType: ev.evidenceType,
        subType: ev.subType,
        url: ev.url,
        reportData: ev.reportData,
        pdfUrl: ev.pdfUrl,
        description: ev.description,
        academicYear: ev.academicYear,
        semester: ev.semester,
        submittedById: ev.submittedById,
        status: ev.status,
        rejectionReason: ev.rejectionReason,
        reviewedById: ev.reviewedById,
        reviewedAt: ev.reviewedAt ? new Date(ev.reviewedAt) : null,
        createdAt: new Date(ev.createdAt),
        updatedAt: new Date(ev.updatedAt),
      }))
    });
  }

  console.log('Importing AuditLogs (' + (data.AuditLog || []).length + ')...');
  if (data.AuditLog && data.AuditLog.length > 0) {
    await prisma.auditLog.createMany({
      data: data.AuditLog.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: new Date(log.createdAt),
      }))
    });
  }

  console.log('DONE! All tables imported cleanly with createMany.');
}

main()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
