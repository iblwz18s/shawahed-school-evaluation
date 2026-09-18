const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.schoolSetting.updateMany({
    data: {
      academicYear: '١٤٤٧-١٤٤٨هـ',
      schoolName: 'ابتدائية سعد بن أبي وقاص',
      educationDepartment: 'إدارة التعليم بمنطقة الحدود الشمالية',
    },
  });
  console.log('SchoolSetting updated to purely Hijri academic year.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
