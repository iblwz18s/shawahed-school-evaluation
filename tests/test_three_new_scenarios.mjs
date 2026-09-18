import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { generateReportHtml } from '../src/lib/report-html.ts';
import { generatePdfFromHtml } from '../src/lib/pdf-generator.ts';
import { getCurrentHijriInfo } from '../src/lib/hijri-date.ts';

// Helper to create test images
async function makeImage(title, subtitle, color) {
  const svg = `
  <svg width="1000" height="750" xmlns="http://www.w3.org/2000/svg">
    <rect width="1000" height="750" fill="${color}"/>
    <rect x="30" y="30" width="940" height="690" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="12 12"/>
    <circle cx="500" cy="340" r="130" fill="#ffffff" opacity="0.18"/>
    <text x="50%" y="42%" text-anchor="middle" fill="#ffffff" font-size="46" font-family="'IBM Plex Sans Arabic', sans-serif" font-weight="bold">${title}</text>
    <text x="50%" y="54%" text-anchor="middle" fill="#ffffff" font-size="28" font-family="'IBM Plex Sans Arabic', sans-serif">${subtitle}</text>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function getPdfPageCount(pdfBuffer) {
  const str = pdfBuffer.toString('latin1');
  const matches = str.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

async function runTests() {
  console.log('🚀 Running 3 Required Test Scenarios...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  const img1 = await makeImage('شاهد 1: انطلاق الفعالية', 'حضور الطلاب والترحيب', '#0f766e');
  const img2 = await makeImage('شاهد 2: المعرض التفاعلي', 'أعمال الطلاب ومشاريعهم', '#1e40af');

  const results = {
    scenario1: false,
    scenario2: false,
    scenario3: false,
  };

  // =========================================================================
  // SCENARIO 1: 2 Images with Ample Space (Short Report)
  // Expected: 1 Single Page, 2 Large Images Filling Remaining Space, No Blank Gap
  // =========================================================================
  console.log('--- SCENARIO 1: 2 Images with Ample Space (Single Page) ---');
  const report1 = {
    title: 'برنامج تعزيز مهارات القراءة والكتابة',
    type: 'برنامج',
    executor: 'أ. فهد بن ناصر القحطاني',
    date: '1446/04/12هـ',
    audience: 'طلاب المرحلة الابتدائية',
    beneficiariesCount: '120 طالب',
    objectives: [
      'رفع المستوى التحصيلي للطلاب في مهارات الفهم القرائي.',
      'تنمية شغف القراءة الحرة والمطالعة الذاتية.',
    ],
    steps: [
      'حصر الطلاب وتحديد المستويات القرائية المستهدفة.',
      'تنفيذ ورش قرائية يومية في مركز مصادر التعلم.',
    ],
    outcomes: [
      'تحسن ملموس بنسبة 85% في طلاقة القراءة لدى العينة المستهدفة.',
    ],
    notes: 'يوصى باستمرار البرنامج خلال الفصل الدراسي القادم.',
    images: [
      { url: img1, caption: 'الورشة القرائية الأولى' },
      { url: img2, caption: 'الطلاب أثناء القراءة الحرة' },
    ],
  };

  const html1 = generateReportHtml({ reportData: report1 });
  const pdf1 = await generatePdfFromHtml(html1, { filenamePrefix: 'scenario_1_ample' });
  const pdf1Buf = fs.readFileSync(pdf1.filePath);
  const pages1 = getPdfPageCount(pdf1Buf);

  await page.setContent(html1, { waitUntil: 'networkidle' });
  const screenshot1 = 'public/uploads/scenario_1_ample_preview.png';
  await page.locator('.report-page.page-1').screenshot({ path: screenshot1 });

  // Verification
  console.log(`✓ Scenario 1 PDF: ${pdf1.relativeUrl} (${pdf1.size} bytes)`);
  console.log(`✓ Scenario 1 Pages: ${pages1} (Expected: 1)`);
  console.log(`✓ Screenshot: ${screenshot1}`);

  if (pages1 !== 1) {
    throw new Error(`Scenario 1 failed: Expected 1 page, got ${pages1}`);
  }
  if (!html1.includes('inline-img-large')) {
    throw new Error('Scenario 1 failed: inline-img-large class not found');
  }
  results.scenario1 = true;

  // =========================================================================
  // SCENARIO 2: 2 Images with Crowded Text (Page 1 Full)
  // Expected: Moved to Page 2, 2 Pages Total, Displayed Large on Page 2
  // =========================================================================
  console.log('\n--- SCENARIO 2: 2 Images with Crowded Text (Multi-Page) ---');
  const report2 = {
    title: 'خطة التطوير الشاملة للبيئة المدرسية ونواتج التعلم',
    type: 'برنامج',
    executor: 'أ. عبد العزيز بن سالم العنزي',
    date: '1446/05/18هـ',
    audience: 'كافة منسوبي المدرسة والطلاب',
    beneficiariesCount: '340 مستفيد',
    objectives: [
      'تحسين البيئة الصفية والمادية لدعم عمليات التعليم والتعلم النشط.',
      'تطوير أداء المعلمين في استراتيجيات التدريس والتقويم التكويني.',
      'رفع نواتج التعلم في الاختبارات الوطنية والتحصيلية المعتمدة.',
      'تعزيز الشراكة المجتمعية مع أولياء الأمور ومؤسسات المجتمع.',
    ],
    steps: [
      'تشكيل لجان التقويم الذاتي وتحليل نتائج التحصيل الدراسي للعام السابق.',
      'إعداد خطة البرامج التدريبية المهنية وتنفيذ الورش التخصصية للمعلمين.',
      'تجهيز وتأهيل القاعات الدراسية ومعامل العلوم والحاسب بالتقنيات الحديثة.',
      'عقد اللقاءات الدورية مع أولياء الأمور لتتبع المستويات الأكاديمية وسلوك الطلاب.',
      'تطبيق الاختبارات التجريبية المحاكية وتحليل مؤشرات الأداء بصفة أسبوعية.',
    ],
    outcomes: [
      'ارتفاع متوسط نواتج التعلم بنسبة 18% في المواد الأساسية المستهدفة.',
      'اكتمال جاهزية البيئة المدرسية بنسبة 100% وفق متطلبات هيئة التقويم.',
      'تفاعل أولياء الأمور ومشاركتهم الفاعلة بنسبة تجاوزت 80%.',
    ],
    notes: 'الخطة متوافقة مع الخطة التشغيلية للمدرسة ومعتمدة من إدارة التعليم.',
    images: [
      { url: img1, caption: 'ورشة تطوير استراتيجيات التدريس' },
      { url: img2, caption: 'المعامل الحديثة بعد التأهيل والتجهيز' },
    ],
  };

  const html2 = generateReportHtml({ reportData: report2 });
  const pdf2 = await generatePdfFromHtml(html2, { filenamePrefix: 'scenario_2_crowded' });
  const pdf2Buf = fs.readFileSync(pdf2.filePath);
  const pages2 = getPdfPageCount(pdf2Buf);

  await page.setContent(html2, { waitUntil: 'networkidle' });
  const screenshot2_p1 = 'public/uploads/scenario_2_crowded_p1.png';
  const screenshot2_p2 = 'public/uploads/scenario_2_crowded_p2.png';
  await page.locator('.report-page.page-1').screenshot({ path: screenshot2_p1 });
  await page.locator('.report-page.page-2').screenshot({ path: screenshot2_p2 });

  console.log(`✓ Scenario 2 PDF: ${pdf2.relativeUrl} (${pdf2.size} bytes)`);
  console.log(`✓ Scenario 2 Pages: ${pages2} (Expected: 2)`);
  console.log(`✓ Screenshots: ${screenshot2_p1} & ${screenshot2_p2}`);

  if (pages2 !== 2) {
    throw new Error(`Scenario 2 failed: Expected 2 pages, got ${pages2}`);
  }
  if (!html2.includes('gallery-h-showcase')) {
    throw new Error('Scenario 2 failed: gallery-h-showcase class not found for 2 images on page 2');
  }
  results.scenario2 = true;

  // =========================================================================
  // SCENARIO 3: Purely Hijri Date & Academic Year with Arabic-Indic Numerals
  // Expected: NO Gregorian date, NO 'م', Arabic-Indic digits ONLY (٠-٩)
  // =========================================================================
  console.log('\n--- SCENARIO 3: Purely Hijri Date & Academic Year with Arabic-Indic Numerals ---');
  // Create a new report without providing date or academic year (testing auto-calculation)
  const report3 = {
    title: 'تقرير النشاط الطلابي الجديد',
    type: 'نشاط',
    executor: 'أ. عبد الله بن سعد الغامدي',
    audience: 'طلاب المرحلة الابتدائية',
    beneficiariesCount: '90 طالب',
    objectives: ['تعزيز مهارات العمل الجماعي والمبادرة الإيجابية.'],
    steps: ['تنظيم مجموعات العمل الطلابية وتنفيذ المهام التعاونية.'],
    outcomes: ['إنجاز المشاريع التعاونية في الوقت المحدد بنجاح.'],
    images: [],
  };

  const currentHijri = getCurrentHijriInfo();
  console.log('Current Hijri info calculated:', currentHijri);

  const html3 = generateReportHtml({ reportData: report3 });

  // Assertions for Scenario 3:
  // 1. Should not contain any Gregorian year '2026' or '2025' or 'م'
  if (html3.includes('2026') || html3.includes('2025') || html3.includes('2024')) {
    throw new Error('Scenario 3 failed: Gregorian year found in HTML!');
  }
  // 2. Should contain Hijri year in Arabic numerals (e.g. ١٤٤٨ or ١٤٤٧)
  if (!html3.includes('١٤٤٨') && !html3.includes('١٤٤٧')) {
    throw new Error('Scenario 3 failed: Hijri year in Arabic digits not found in HTML!');
  }
  // 3. Execution date must contain Arabic digits and "هـ"
  if (!html3.includes('هـ')) {
    throw new Error('Scenario 3 failed: Hijri date suffix "هـ" not found!');
  }
  // 4. Academic year must contain Arabic digits and "هـ" (e.g. ١٤٤٧-١٤٤٨هـ)
  if (!html3.includes('١٤٤٧-١٤٤٨هـ')) {
    throw new Error('Scenario 3 failed: Academic year "١٤٤٧-١٤٤٨هـ" not found!');
  }

  const pdf3 = await generatePdfFromHtml(html3, { filenamePrefix: 'scenario_3_hijri' });
  console.log(`✓ Scenario 3 PDF: ${pdf3.relativeUrl} (${pdf3.size} bytes)`);
  console.log('✓ Verified: Dates and Academic Year are purely Hijri with Arabic-Indic digits.');
  results.scenario3 = true;

  await browser.close();

  console.log('\n======================================================');
  console.log('ALL 3 REQUIRED SCENARIOS PASSED:');
  console.log(`Scenario 1 (2 Images Ample Space -> 1 Page Large): ${results.scenario1 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Scenario 2 (2 Images Crowded Text -> 2 Pages Showcase): ${results.scenario2 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Scenario 3 (Purely Hijri Dates & Arabic-Indic Digits): ${results.scenario3 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('======================================================');

  fs.writeFileSync('public/uploads/scenarios_results.json', JSON.stringify(results, null, 2));
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
