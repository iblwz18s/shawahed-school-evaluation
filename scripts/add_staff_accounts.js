/**
 * تجهيز حسابات الكادر التعليمي بأساليب دخول سهلة.
 *
 * القاعدة المعتمدة (من src/data/staff-accounts.json):
 *   اسم الدخول  = أول حرفين من الاسم بالإنجليزية + النطاق   →  Os@saad.sa  (ويمكن كتابة Os فقط)
 *   كلمة المرور = نفس الحرفين + 2030                        →  Os2030
 *
 * السكربت آمن لإعادة التشغيل (idempotent): يُنشئ الناقص، ويحدّث الموجود،
 * وينقل الحسابين التجريبيين القديمين إلى المخطط الجديد دون فقدان سجلهما.
 *
 * التشغيل:  node scripts/add_staff_accounts.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const staffData = require('../src/data/staff-accounts.json');

const prisma = new PrismaClient();

/** الحسابات التجريبية القديمة التي نُعيد ربطها بالكود الجديد بدل حذفها (حفاظاً على الشواهد). */
const LEGACY_EMAIL_TO_CODE = {
  'admin@example.com': 'Fh',
  'teacher@example.com': 'Os',
};

const loginEmail = (code) => `${code.toLowerCase()}@${staffData.loginDomain}`;
const loginPassword = (code) => `${code}${staffData.passwordSuffix}`;

async function main() {
  console.log(`--- تجهيز حسابات الكادر (${staffData.accounts.length} حساب) ---`);

  // نسخة احتياطية من صفوف المستخدمين الحالية قبل أي تعديل (بدون كلمات المرور المشفّرة)
  const existingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  const backupDir = path.join(__dirname, '..', 'prisma', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(
    backupDir,
    `users-before-staff-provision-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(backupFile, JSON.stringify(existingUsers, null, 2), 'utf8');
  console.log(`نسخة احتياطية من ${existingUsers.length} مستخدماً: ${backupFile}`);

  const results = [];

  for (const account of staffData.accounts) {
    const email = loginEmail(account.code);
    const password = loginPassword(account.code);
    const passwordHash = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email } });
    let action = 'created';

    if (!user) {
      const legacyEmail = Object.keys(LEGACY_EMAIL_TO_CODE).find(
        (old) => LEGACY_EMAIL_TO_CODE[old] === account.code
      );

      if (legacyEmail) {
        const legacyUser = await prisma.user.findUnique({ where: { email: legacyEmail } });
        if (legacyUser) {
          user = await prisma.user.update({
            where: { id: legacyUser.id },
            data: {
              name: account.name,
              email,
              passwordHash,
              role: account.role,
              isActive: true,
            },
          });
          action = `migrated from ${legacyEmail}`;
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: account.name,
            email,
            passwordHash,
            role: account.role,
            isActive: true,
          },
        });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: account.name,
          passwordHash,
          role: account.role,
          isActive: true,
        },
      });
      action = 'updated';
    }

    results.push({
      name: user.name,
      code: account.code,
      login: email,
      shortLogin: account.code,
      password,
      role: account.role,
      action,
    });
  }

  const total = await prisma.user.count();
  const teachers = await prisma.user.count({ where: { role: 'teacher' } });
  const admins = await prisma.user.count({ where: { role: 'admin' } });

  console.log('\nالاسم'.padEnd(2) + ' | الاسم المختصر | اسم الدخول | كلمة المرور | الدور | الإجراء');
  console.log('-'.repeat(96));
  for (const row of results) {
    console.log(
      `${row.name} | ${row.shortLogin} | ${row.login} | ${row.password} | ${
        row.role === 'admin' ? 'مدير' : 'معلم'
      } | ${row.action}`
    );
  }

  console.log('-'.repeat(96));
  console.log(`الخلاصة: ${total} مستخدماً (${admins} مدير · ${teachers} معلماً)`);
}

main()
  .catch((error) => {
    console.error('فشل تجهيز الحسابات:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
