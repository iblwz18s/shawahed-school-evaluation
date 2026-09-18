/**
 * وظائف مساعدة لحساب وتنسيق التاريخ الهجري والعام الدراسي بالأرقام العربية فقط
 */

export function toArabicDigits(val: string | number | null | undefined): string {
  if (val === undefined || val === null) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(val).replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
}

export interface HijriDateInfo {
  hijriDate: string;        // مثال: ١٧-٠٩-١٤٤٨هـ
  academicYear: string;     // مثال: ١٤٤٧-١٤٤٨هـ
  day: string;              // ٠٧
  month: string;            // ٠٤
  year: string;             // ١٤٤٨
}

/**
 * استخراج التاريخ الهجري الحالي وحساب العام الدراسي المقابل له
 */
export function getCurrentHijriInfo(customDate = new Date()): HijriDateInfo {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(customDate);

    const partMap: Record<string, string> = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const rawDay = String(partMap.day || '1').padStart(2, '0');
    const rawMonth = String(partMap.month || '1').padStart(2, '0');
    const rawYear = parseInt(partMap.year || '1448', 10);

    const day = toArabicDigits(rawDay);
    const month = toArabicDigits(rawMonth);
    const year = toArabicDigits(rawYear);

    // صيغة التاريخ الهجري اليوم-الشهر-السنة هـ
    const hijriDate = `${day}-${month}-${year}هـ`;

    // حساب العام الدراسي: في التقويم الدراسي السعودي يبدأ العام غالباً بين صفر وشهر ربيع الأول
    // إذا كان الشهر بين محرم ورجب (1 إلى 7) فالعام الدراسي بدأ في العام الهجري السابق
    // وإلا فبدأ في نفس العام
    const m = parseInt(rawMonth, 10);
    const startYear = (m >= 1 && m <= 7) ? rawYear - 1 : rawYear;
    const endYear = startYear + 1;
    const academicYear = `${toArabicDigits(startYear)}-${toArabicDigits(endYear)}هـ`;

    return {
      hijriDate,
      academicYear,
      day,
      month,
      year,
    };
  } catch (err) {
    return {
      hijriDate: toArabicDigits('١٧-٠٩-١٤٤٨هـ'),
      academicYear: toArabicDigits('١٤٤٧-١٤٤٨هـ'),
      day: toArabicDigits('١٧'),
      month: toArabicDigits('٠٩'),
      year: toArabicDigits('١٤٤٨'),
    };
  }
}

/**
 * تنظيف وتحويل أي نص تاريخ إلى هجري فقط بأرقام عربية (حذف أي إشارة للميلادي)
 */
export function formatHijriOnly(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr === '—') {
    return getCurrentHijriInfo().hijriDate;
  }

  // حذف التواريخ الميلادية وأي إشارة لحرف 'م' أو سنين مثل 2024, 2025, 2026
  let cleaned = dateStr
    .replace(/\/?\s*20\d{2}\s*م?/g, '')
    .replace(/\/?\s*\d{4}\s*م/g, '')
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s*م\s*$/g, '')
    .trim();

  // إذا أصبح فارغاً بعد الحذف، نعتمد التاريخ الهجري الحالي
  if (!cleaned) {
    return getCurrentHijriInfo().hijriDate;
  }

  // إضافة هـ إذا لم تكن موجودة
  if (!cleaned.includes('هـ')) {
    cleaned = `${cleaned}هـ`;
  }

  return toArabicDigits(cleaned);
}

/**
 * تنظيف وتحويل العام الدراسي إلى هجري فقط بأرقام عربية
 */
export function formatAcademicYearOnly(yearStr?: string | null): string {
  if (!yearStr || yearStr.trim() === '') {
    return getCurrentHijriInfo().academicYear;
  }

  let cleaned = yearStr
    .replace(/\/?\s*20\d{2}\s*م?/g, '')
    .replace(/\/?\s*\d{4}\s*م/g, '')
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s*م\s*$/g, '')
    .trim();

  if (!cleaned) {
    return getCurrentHijriInfo().academicYear;
  }

  if (!cleaned.includes('هـ')) {
    cleaned = `${cleaned}هـ`;
  }

  return toArabicDigits(cleaned);
}
