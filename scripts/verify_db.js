const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Users:', await prisma.user.count());
  console.log('Domains:', await prisma.domain.count());
  console.log('Standards:', await prisma.standard.count());
  console.log('Indicators:', await prisma.indicator.count());
  console.log('Evidences:', await prisma.evidence.count());
  const setting = await prisma.schoolSetting.findFirst();
  console.log('SchoolSetting:', setting ? {
    schoolName: setting.schoolName,
    educationDepartment: setting.educationDepartment,
    academicYear: setting.academicYear
  } : null);
}

main().finally(() => prisma.$disconnect());
