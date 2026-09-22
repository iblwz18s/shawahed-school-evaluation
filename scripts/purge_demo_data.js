/**
 * تنظيف البيانات التجريبية وإعادة تسمية الحسابات.
 *
 * - ينسخ الشواهد وسجلات التدقيق إلى ملف نسخة احتياطية قبل الحذف.
 * - يحذف كل الشواهد (تجريبية) وكل سجلات التدقيق.
 * - يعيد تسمية حساب المدير وحساب المعلم إلى الأسماء الرسمية.
 *
 * التشغيل:  node scripts/purge_demo_data.js
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const staffData = require('../src/data/staff-accounts.json');

const prisma = new PrismaClient();

/** الأسماء الرسمية لحسابات الكادر، مربوطة بمخطط الدخول المعتمد في src/data/staff-accounts.json */
const RENAMES = staffData.accounts.map((account) => ({
  email: `${account.code.toLowerCase()}@${staffData.loginDomain}`,
  name: account.name,
}));

function backupDir() {
  const dir = path.join('prisma', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function main() {
  const evidences = await prisma.evidence.findMany();
  const auditLogs = await prisma.auditLog.findMany();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(backupDir(), `deleted-demo-data-${stamp}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ exportedAt: new Date().toISOString(), evidences, auditLogs }, null, 2),
    'utf-8'
  );
  console.log(`نسخة احتياطية: ${file} (${evidences.length} شاهداً، ${auditLogs.length} سجلاً)`);

  const result = await prisma.$transaction([
    prisma.auditLog.deleteMany({}),
    prisma.evidence.deleteMany({}),
  ]);
  console.log(`حُذف: ${result[0].count} سجل تدقيق، ${result[1].count} شاهداً`);

  for (const { email, name } of RENAMES) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`لم يُوجد حساب ${email} — تخطٍّ.`);
      continue;
    }
    const updated = await prisma.user.update({ where: { email }, data: { name } });
    console.log(`أُعيدت تسمية ${email}: «${user.name}» → «${updated.name}»`);
  }

  const counts = {
    users: await prisma.user.count(),
    evidences: await prisma.evidence.count(),
    auditLogs: await prisma.auditLog.count(),
    domains: await prisma.domain.count(),
    standards: await prisma.standard.count(),
    indicators: await prisma.indicator.count(),
    settings: await prisma.schoolSetting.count(),
  };
  console.log('العدّ النهائي:', JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error('خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
