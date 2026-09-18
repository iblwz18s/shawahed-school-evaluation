import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';

async function makeImage(title, subtitle, color) {
  const svg = `
  <svg width="1000" height="750" xmlns="http://www.w3.org/2000/svg">
    <rect width="1000" height="750" fill="${color}"/>
    <rect x="30" y="30" width="940" height="690" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="12 12"/>
    <circle cx="500" cy="340" r="130" fill="#ffffff" opacity="0.18"/>
    <text x="50%" y="42%" text-anchor="middle" fill="#ffffff" font-size="46" font-family="sans-serif" font-weight="bold">${title}</text>
    <text x="50%" y="54%" text-anchor="middle" fill="#ffffff" font-size="28" font-family="sans-serif">${subtitle}</text>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return buf;
}

function getPdfPageCount(pdfBuffer) {
  const str = pdfBuffer.toString('latin1');
  const matches = str.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

async function runThreeCases() {
  console.log('🚀 Running 3-Case Live Verification on Production Server...\n');

  // 1. Authenticate as Teacher
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@example.com', password: 'teacher123' }),
  });
  const cookie = loginRes.headers.get('set-cookie');

  // Helper to upload image to server
  async function uploadImage(buffer, filename) {
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'image/png' }), filename);
    const res = await fetch(`${BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers: { Cookie: cookie },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload');
    return data.url;
  }

  console.log('Uploading sample evidence images...');
  const buf1 = await makeImage('شاهد 1: انطلاق الفعالية', 'حضور الطلاب والترحيب', '#0f766e');
  const buf2 = await makeImage('شاهد 2: ورشة العمل التفاعلية', 'تطبيق الأنشطة التعليمية', '#1e40af');
  const buf3 = await makeImage('شاهد 3: العرض التقديمي', 'مشاركة الطلاب المبدعين', '#b45309');
  const buf4 = await makeImage('شاهد 4: المعرض والإنتاج', 'نماذج من مخرجات المبادرة', '#4338ca');
  const buf5 = await makeImage('شاهد 5: التقييم والتحكيم', 'لجنة التحكيم المدرسية', '#047857');
  const buf6 = await makeImage('شاهد 6: التكريم والختام', 'تسليم شهادات الشكر والجوائز', '#be123c');

  const u1 = await uploadImage(buf1, 'evidence_c1.png');
  const u2 = await uploadImage(buf2, 'evidence_c2.png');
  const u3 = await uploadImage(buf3, 'evidence_c3.png');
  const u4 = await uploadImage(buf4, 'evidence_c4.png');
  const u5 = await uploadImage(buf5, 'evidence_c5.png');
  const u6 = await uploadImage(buf6, 'evidence_c6.png');
  console.log('✓ All 6 images uploaded to server.\n');

  const results = {};

  // -------------------------------------------------------------
  // Case 1: Short Report with 2 Images
  // -------------------------------------------------------------
  console.log('--- TEST 1: Short Report (2 Images) ---');
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
      { url: u1, caption: 'الورشة القرائية الأولى' },
      { url: u2, caption: 'الطلاب أثناء القراءة الحرة' },
    ],
  };

  const res1 = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      reportData: report1,
      indicatorCode: '1-1-1-1',
      indicatorText: 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
    }),
  });
  const data1 = await res1.json();
  if (!res1.ok || !data1.pdfUrl) throw new Error(`Case 1 failed: ${data1.error || res1.status}`);

  // Fetch PDF file over HTTP
  const fetch1 = await fetch(`${BASE_URL}${data1.pdfUrl}`);
  if (fetch1.status !== 200) throw new Error(`Case 1 PDF fetch returned ${fetch1.status}`);
  const pdfBytes1 = Buffer.from(await fetch1.arrayBuffer());
  const pages1 = getPdfPageCount(pdfBytes1);
  console.log(`✓ Case 1 Success: ${data1.pdfUrl}`);
  console.log(`  Size: ${pdfBytes1.length} bytes | Pages: ${pages1} (Expected: 1)`);
  results.case1 = { passed: pages1 === 1, url: data1.pdfUrl, pages: pages1, size: pdfBytes1.length };

  // -------------------------------------------------------------
  // Case 2: Medium Report with 4 Images
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Medium Report (4 Images) ---');
  const report2 = {
    title: 'مبادرة السلامة المدرسية والإخلاء الفرضي',
    type: 'مبادرة',
    executor: 'أ. عبد العزيز بن سالم العنزي',
    date: '1446/05/18هـ',
    audience: 'كافة منسوبي المدرسة والطلاب',
    beneficiariesCount: '340 مستفيد',
    objectives: [
      'تدريب الطلاب ومنسوبي المدرسة على خطة الإخلاء الآمن.',
      'التحقق من جاهزية مخارج الطوارئ وأدوات الإطفاء والسلامة.',
      'نشر ثقافة السلامة والوقاية من المخاطر البيئية.',
    ],
    steps: [
      'تحديد مسارات الإخلاء وتوزيع نقاط التجمع في الفناء المدرسي.',
      'إطلاق جرس الإنذار وتنفيذ فرضية الإخلاء في زمن قياسي.',
      'حصر الحضور في نقطة التجمع والتأكد من سلامة الجميع.',
    ],
    outcomes: [
      'إخلاء المبنى بالكامل دون أي إصابات في زمن قياسي.',
      'إكساب الطلاب مهارات التعامل الهادئ والسريع مع الإنذارات.',
    ],
    notes: 'تمت الفرضية بالتنسيق والمتابعة مع الدفاع المدني.',
    images: [
      { url: u1, caption: 'انطلاق صفارات الإنذار والإخلاء' },
      { url: u2, caption: 'مسارات الخروج المنتظمة' },
      { url: u3, caption: 'نقطة التجمع في الساحة الخارجية' },
      { url: u4, caption: 'التدريب على طفايات الحريق' },
    ],
  };

  const res2 = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      reportData: report2,
      indicatorCode: '1-1-1-1',
      indicatorText: 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
    }),
  });
  const data2 = await res2.json();
  if (!res2.ok || !data2.pdfUrl) throw new Error(`Case 2 failed: ${data2.error || res2.status}`);

  const fetch2 = await fetch(`${BASE_URL}${data2.pdfUrl}`);
  if (fetch2.status !== 200) throw new Error(`Case 2 PDF fetch returned ${fetch2.status}`);
  const pdfBytes2 = Buffer.from(await fetch2.arrayBuffer());
  const pages2 = getPdfPageCount(pdfBytes2);
  console.log(`✓ Case 2 Success: ${data2.pdfUrl}`);
  console.log(`  Size: ${pdfBytes2.length} bytes | Pages: ${pages2} (Expected: 2)`);
  results.case2 = { passed: pages2 === 2, url: data2.pdfUrl, pages: pages2, size: pdfBytes2.length };

  // -------------------------------------------------------------
  // Case 3: Long Report with 6 Images
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Long Report (6 Images) ---');
  const report3 = {
    title: 'ملتقى الابتكار والموهبة والتحول الرقمي',
    type: 'ملتقى',
    executor: 'د. خالد بن صالح الشمري',
    date: '1446/06/02هـ',
    audience: 'المعلمون، الطلاب، وأولياء الأمور',
    beneficiariesCount: '450 مشارك',
    objectives: [
      'تشجيع التفكير الإبداعي والابتكار الرقمي في البيئة التعليمية.',
      'استعراض مشروعات الروبوت والذكاء الاصطناعي المنفذة من الطلاب.',
      'تفعيل الشراكة المجتمعية مع الأسرة لدعم المواهب الناشئة.',
      'تطوير مهارات القرن الحادي والعشرين وحل المشكلات.',
    ],
    steps: [
      'الإعلان عن استقبال مشروعات الابتكار وتحكيم المشاركات الأولية.',
      'تجهيز أجنحة المعرض التفاعلي ومسرح العروض الابتكارية.',
      'افتتاح الملتقى بحضور مشرفي إدارة التعليم وأولياء الأمور.',
      'إقامة جلسات حوارية وورش تدريبية تفاعلية حول الذكاء الاصطناعي.',
      'تكريم المشروعات الثلاثة الفائزة بالمراكز الأولى.',
    ],
    outcomes: [
      'مشاركة 35 مشروعاً ابتكارياً وتقنياً من مختلف الفصول.',
      'حضور وتفاعل أكثر من 450 زائراً ومشاركاً في فعاليات الملتقى.',
      'تأهيل 4 مشروعات للمنافسة على مستوى إدارة التعليم بالمنطقة.',
    ],
    notes: 'حقق الملتقى أهدافه بنسبة 100%، وأشادت به لجنة التحكيم من إدارة التعليم.',
    images: [
      { url: u1, caption: 'حفل افتتاح ملتقى الابتكار' },
      { url: u2, caption: 'جناح مشروعات الروبوت والبرمجة' },
      { url: u3, caption: 'ورشة الذكاء الاصطناعي التفاعلية' },
      { url: u4, caption: 'تفاعل أولياء الأمور والطلاب' },
      { url: u5, caption: 'لجنة التحكيم تقيّم الابتكارات' },
      { url: u6, caption: 'تكريم المشروعات الفائزة في الحفل الختامي' },
    ],
  };

  const res3 = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      reportData: report3,
      indicatorCode: '1-1-1-1',
      indicatorText: 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
    }),
  });
  const data3 = await res3.json();
  if (!res3.ok || !data3.pdfUrl) throw new Error(`Case 3 failed: ${data3.error || res3.status}`);

  const fetch3 = await fetch(`${BASE_URL}${data3.pdfUrl}`);
  if (fetch3.status !== 200) throw new Error(`Case 3 PDF fetch returned ${fetch3.status}`);
  const pdfBytes3 = Buffer.from(await fetch3.arrayBuffer());
  const pages3 = getPdfPageCount(pdfBytes3);
  console.log(`✓ Case 3 Success: ${data3.pdfUrl}`);
  console.log(`  Size: ${pdfBytes3.length} bytes | Pages: ${pages3} (Expected: 2)`);
  results.case3 = { passed: pages3 === 2, url: data3.pdfUrl, pages: pages3, size: pdfBytes3.length };

  console.log('\n======================================================');
  console.log('FINAL RESULTS FOR 3 CASES:');
  console.log(`Case 1 (Short - 2 Images): ${results.case1.passed ? 'PASSED ✅' : 'FAILED ❌'} (${results.case1.pages} Page)`);
  console.log(`Case 2 (Medium - 4 Images): ${results.case2.passed ? 'PASSED ✅' : 'FAILED ❌'} (${results.case2.pages} Pages)`);
  console.log(`Case 3 (Long - 6 Images): ${results.case3.passed ? 'PASSED ✅' : 'FAILED ❌'} (${results.case3.pages} Pages)`);
  console.log('======================================================');

  fs.writeFileSync('public/uploads/three_cases_results.json', JSON.stringify(results, null, 2));
}

runThreeCases().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
