import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';

// Helper for Arabic digits
function toArabicDigits(val) {
  if (val === undefined || val === null) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(val).replace(/[0-9]/g, (d) => arabicDigits[d]);
}

// Helper to compute current Hijri date and academic year
function getCurrentHijriInfo(customDate = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(customDate);

    const partMap = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const day = String(partMap.day).padStart(2, '0');
    const month = String(partMap.month).padStart(2, '0');
    const year = parseInt(partMap.year, 10);

    const hijriDate = toArabicDigits(`${day}-${month}-${year}هـ`);
    const m = parseInt(month, 10);
    // إذا كان الشهر بين محرم ورجب (1 إلى 7) فالعام الدراسي بدأ في العام الماضي
    // وإلا فالعام الدراسي بدأ في نفس العام
    const startYear = (m >= 1 && m <= 7) ? year - 1 : year;
    const endYear = startYear + 1;
    const academicYear = toArabicDigits(`${startYear}-${endYear}هـ`);

    return {
      hijriDate,
      academicYear,
      day: toArabicDigits(day),
      month: toArabicDigits(month),
      year: toArabicDigits(year),
    };
  } catch (err) {
    return {
      hijriDate: toArabicDigits('١٧-٠٩-١٤٤٨هـ'),
      academicYear: toArabicDigits('١٤٤٧-١٤٤٨هـ'),
    };
  }
}

// Clean and convert any existing date string to purely Hijri with Arabic-Indic digits
function formatHijriOnly(dateStr) {
  if (!dateStr || dateStr.trim() === '' || dateStr === '—') {
    return getCurrentHijriInfo().hijriDate;
  }
  // Strip any Gregorian indicators (e.g. "م", "2026م", "2025/2026", etc.)
  let cleaned = dateStr
    .replace(/\/?\s*\d{4}\s*م/g, '')
    .replace(/[a-zA-Z]/g, '')
    .trim();

  // If after cleaning it's empty, use current Hijri
  if (!cleaned) return getCurrentHijriInfo().hijriDate;

  // Ensure "هـ" suffix
  if (!cleaned.includes('هـ')) {
    cleaned = `${cleaned}هـ`;
  }
  return toArabicDigits(cleaned);
}

// Clean and convert academic year to purely Hijri with Arabic-Indic digits
function formatAcademicYearOnly(yearStr) {
  if (!yearStr || yearStr.trim() === '') {
    return getCurrentHijriInfo().academicYear;
  }
  // Remove any Gregorian year like / 2026م
  let cleaned = yearStr
    .replace(/\/?\s*\d{4}\s*م/g, '')
    .replace(/[a-zA-Z]/g, '')
    .trim();

  if (!cleaned) return getCurrentHijriInfo().academicYear;
  if (!cleaned.includes('هـ')) {
    cleaned = `${cleaned}هـ`;
  }
  return toArabicDigits(cleaned);
}

console.log('Testing date helpers:');
console.log('Current Hijri info:', getCurrentHijriInfo());
console.log('Cleaned "1446/04/12هـ / 2026م":', formatHijriOnly('1446/04/12هـ / 2026م'));
console.log('Cleaned academic year "1447-1448هـ / 2026م":', formatAcademicYearOnly('1447-1448هـ / 2026م'));
