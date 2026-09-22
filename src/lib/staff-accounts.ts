import staffAccountsData from '@/data/staff-accounts.json';

export interface StaffAccountSeed {
  code: string;
  name: string;
  role: 'admin' | 'teacher';
}

/** نطاق بريد الدخول الموحّد لمنسوبي المدرسة (مثال: saad.sa). */
export const STAFF_LOGIN_DOMAIN: string = staffAccountsData.loginDomain;

/** اللاحقة الثابتة لكلمة المرور الافتراضية (مثال: 2030). */
export const STAFF_PASSWORD_SUFFIX: string = staffAccountsData.passwordSuffix;

/** قائمة حسابات الكادر المعتمدة — الكود هو أول حرفين من الاسم بالإنجليزية. */
export const STAFF_ACCOUNTS: StaffAccountSeed[] = staffAccountsData.accounts as StaffAccountSeed[];

/** البريد الإلكتروني/اسم الدخول الكامل لكود معيّن: Os ← os@saad.sa */
export function loginEmailForCode(code: string): string {
  return `${code.trim().toLowerCase()}@${STAFF_LOGIN_DOMAIN}`;
}

/** كلمة المرور الافتراضية لكود معيّن: Os ← Os2030 */
export function defaultPasswordForCode(code: string): string {
  return `${code.trim()}${STAFF_PASSWORD_SUFFIX}`;
}

/** يستخرج الكود من اسم دخول (Os أو Os@saad.sa) — أو null إن لم يكن للنطاق نفسه. */
export function codeFromLoginIdentifier(identifier: string): string | null {
  const value = identifier.trim().toLowerCase();
  if (!value) return null;

  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    if (domain !== STAFF_LOGIN_DOMAIN.toLowerCase()) return null;
    return local || null;
  }

  return value;
}
