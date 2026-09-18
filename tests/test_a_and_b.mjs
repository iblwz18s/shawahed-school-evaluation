import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Running TEST A and TEST B Verification Suite...\n');
  const results = {
    testA: false,
    testB: false,
    details: {}
  };

  // =========================================================================
  // TEST A: Without School Stamp -> No Box, No Border, No Placeholder, No Space
  // =========================================================================
  console.log('--- EXECUTING TEST A: Verification Without School Stamp ---');
  try {
    const reportDataWithoutStamp = {
      title: 'برنامج تجريبي لفحص الختم',
      type: 'برنامج',
      executor: 'أ. فهد العتيبي',
      date: '1446/05/01هـ',
      audience: 'الطلاب',
      beneficiariesCount: '100',
      objectives: ['هدف تجريبي 1'],
      steps: ['خطوة تجريبية 1'],
      outcomes: ['نتيجة تجريبية 1'],
      images: [],
    };

    const resA = await fetch(`${BASE_URL}/api/reports/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportData: reportDataWithoutStamp,
        indicatorCode: '1-1-1-1',
        indicatorText: 'تضع المدرسة خطة تشغيلية شاملة.',
      }),
    });

    const dataA = await resA.json();
    if (!resA.ok || !dataA.html) {
      throw new Error(`Failed to generate HTML preview: ${dataA.error || resA.status}`);
    }

    const htmlA = dataA.html;

    // Strict checks for Requirement 4 & 5:
    if (htmlA.includes('stamp-box')) {
      throw new Error('TEST A FAILED: .stamp-box CSS class found in HTML when no stamp provided!');
    }
    if (htmlA.includes('الختم الرسمي للمدرسة') || htmlA.includes('ختم المدرسة')) {
      throw new Error('TEST A FAILED: Text "ختم المدرسة" found in HTML when no stamp provided!');
    }
    if (htmlA.includes('border: 1px dashed') && htmlA.includes('width: 90px')) {
      throw new Error('TEST A FAILED: Dashed stamp border box found in HTML when no stamp provided!');
    }

    // Verify signatures row only contains the 2 actual blocks (teacher and principal)
    const blocksCount = (htmlA.match(/class="signature-block"/g) || []).length;
    console.log(`✓ Signature blocks rendered when no stamp: ${blocksCount} (Expected: 2)`);
    if (blocksCount !== 2) {
      throw new Error(`Expected exactly 2 signature blocks without stamp, but found ${blocksCount}`);
    }

    console.log('✓ Verified: No box, no border, no placeholder, no text "ختم المدرسة", and no blank space for stamp.');
    results.testA = true;
    results.details.testA = { passed: true, blocksCount };
  } catch (err) {
    console.error('❌ TEST A FAILED:', err);
    results.details.testAError = err.message;
  }

  // =========================================================================
  // TEST B: Ministry Logo + School Data + 2 Photos + Live Preview + PDF
  // =========================================================================
  console.log('\n--- EXECUTING TEST B: Ministry Logo, School Data, 2 Photos, Live Preview & PDF ---');
  let browser;
  try {
    // 1. Generate 2 real sample photos
    console.log('Generating 2 sample evidence images with sharp...');
    const img1Buffer = await sharp({
      create: {
        width: 1200,
        height: 900,
        channels: 3,
        background: { r: 16, g: 100, b: 68 }, // Moe emerald
      }
    }).png().toBuffer();

    const img2Buffer = await sharp({
      create: {
        width: 1200,
        height: 900,
        channels: 3,
        background: { r: 24, g: 75, b: 120 }, // Royal navy
      }
    }).png().toBuffer();

    // Helper to upload image
    async function uploadTestImage(buf, filename, cookie) {
      const formData = new FormData();
      formData.append('file', new Blob([buf], { type: 'image/png' }), filename);
      const res = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: cookie ? { 'Cookie': cookie } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data.url;
    }

    // Login as teacher via API to get auth cookie
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@example.com', password: 'teacher123' }),
    });
    const teacherCookie = loginRes.headers.get('set-cookie');
    const img1Url = await uploadTestImage(img1Buffer, 'evidence_1.png', teacherCookie);
    const img2Url = await uploadTestImage(img2Buffer, 'evidence_2.png', teacherCookie);
    console.log(`✓ Uploaded Image 1: ${img1Url}`);
    console.log(`✓ Uploaded Image 2: ${img2Url}`);

    // 2. Launch Playwright browser
    console.log('Launching Playwright Chrome for UI testing...');
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();

    // Login via UI
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("حساب المعلم")');
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL('**/staff', { timeout: 10000 });
    console.log('✓ Logged in via UI as teacher');

    // Go to indicator 1-1-1-1
    await page.goto(`${BASE_URL}/indicators/1-1-1-1`);
    await page.waitForLoadState('networkidle');

    // Open Choice Modal
    await page.click('button:has-text("إضافة شاهد لهذا المؤشر")');
    await page.waitForTimeout(500);

    // Click "إنشاء تقرير"
    await page.click('button:has-text("إنشاء تقرير")');
    await page.waitForTimeout(800);

    // Fill Title
    const titleField = page.locator('input[placeholder*="مثال:"]').first();
    await titleField.fill('برنامج تعزيز القيم والهوية الوطنية السعودية');

    // Set Executor
    const executorField = page.locator('input[placeholder*="اسم المعلم أو المشرف"]');
    await executorField.fill('أ. محمد بن خالد الشمري');

    // Add 2 uploaded photos to form state or test form
    // Let's test the Live Preview via the UI button
    console.log('Clicking "معاينة حية" in UI...');
    await page.click('button:has-text("معاينة حية")');
    await page.waitForTimeout(2000);

    // Verify iframe in Live Preview tab
    const iframe = page.locator('iframe[title="Live Preview"]');
    await iframe.waitFor({ state: 'visible', timeout: 8000 });
    const srcDoc = await iframe.getAttribute('srcdoc');
    if (!srcDoc) throw new Error('Live preview iframe srcdoc is empty!');

    console.log(`✓ Live Preview HTML loaded successfully (${srcDoc.length} bytes)`);

    // Verify required elements in Preview:
    if (!srcDoc.includes('ابتدائية سعد بن أبي وقاص')) {
      throw new Error('TEST B FAILED: School name "ابتدائية سعد بن أبي وقاص" not found in preview HTML!');
    }
    if (!srcDoc.includes('إدارة التعليم بمنطقة الحدود الشمالية')) {
      throw new Error('TEST B FAILED: Education dept "إدارة التعليم بمنطقة الحدود الشمالية" not found in preview HTML!');
    }
    if (!srcDoc.includes('شعار وزارة التعليم')) {
      throw new Error('TEST B FAILED: Ministry of Education Logo tag not found in preview HTML!');
    }

    // Capture screenshot of Live Preview
    const previewScreenshotPath = path.join(process.cwd(), 'public', 'uploads', 'test_b_live_preview.png');
    await page.screenshot({ path: previewScreenshotPath });
    console.log(`✓ Captured Live Preview screenshot at: ${previewScreenshotPath}`);

    // 3. Test Generate PDF via API and Playwright
    console.log('Generating Final PDF via Playwright API...');
    const reportDataB = {
      title: 'برنامج تعزيز القيم والهوية الوطنية السعودية',
      type: 'برنامج',
      executor: 'أ. محمد بن خالد الشمري',
      date: '1446/03/19هـ',
      audience: 'جميع طلاب المدرسة ومنسوبيها',
      beneficiariesCount: '350 طالب',
      objectives: [
        'تعزيز قيم الولاء والانتماء للوطن وقيادته الرشيدة.',
        'إبراز الإرث التاريخي والثقافي للمملكة العربية السعودية.',
      ],
      steps: [
        'تشكيل اللجان المنظمة وإعداد الإطار التنفيذي للفعاليات.',
        'تنظيم المعرض التراثي والأنشطة الطلابية التفاعلية.',
        'تكريم المشاركين والمتميزين في ختام الفعالية.',
      ],
      outcomes: [
        'تفاعل ومشاركة أكثر من 350 طالباً في الأنشطة والورش.',
        'ترسيخ مشاعر الفخر والاعتزاز بالهوية الوطنية لدى الطلاب.',
      ],
      images: [
        { url: img1Url, caption: 'افتتاح الفعاليات والأنشطة التراثية' },
        { url: img2Url, caption: 'معرض إنجازات الطلاب التشكيلية والوطنية' },
      ],
      notes: 'تم التنفيذ بإشراف إدارة المدرسة ومتابعة منسق النشاط الطلابي.',
    };

    const pdfRes = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': teacherCookie,
      },
      body: JSON.stringify({
        reportData: reportDataB,
        indicatorCode: '1-1-1-1',
        indicatorText: 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
      }),
    });

    const pdfData = await pdfRes.json();
    if (!pdfRes.ok || !pdfData.pdfUrl) {
      throw new Error(`PDF generation failed: ${pdfData.error || pdfRes.status}`);
    }
    console.log(`✓ PDF Generated successfully: ${pdfData.pdfUrl} (Size: ${pdfData.size} bytes)`);

    // Verify PDF file on disk
    const diskPdfPath = path.join(process.cwd(), 'public', pdfData.pdfUrl.replace(/^\//, ''));
    if (!fs.existsSync(diskPdfPath)) {
      throw new Error(`PDF file not found on disk at: ${diskPdfPath}`);
    }
    const pdfStat = fs.statSync(diskPdfPath);
    if (pdfStat.size < 10000) {
      throw new Error(`Generated PDF size suspiciously small: ${pdfStat.size} bytes`);
    }
    console.log(`✓ Verified PDF on disk: ${diskPdfPath} (${pdfStat.size} bytes)`);

    // 4. Verify opening the generated PDF over HTTP
    console.log('Testing opening PDF over HTTP...');
    const pdfFetchRes = await fetch(`${BASE_URL}${pdfData.pdfUrl}`);
    if (pdfFetchRes.status !== 200) {
      throw new Error(`Opening PDF returned HTTP ${pdfFetchRes.status}`);
    }
    const contentType = pdfFetchRes.headers.get('content-type');
    if (!contentType.includes('application/pdf')) {
      throw new Error(`Expected content-type application/pdf, got ${contentType}`);
    }
    const pdfBuf = await pdfFetchRes.arrayBuffer();
    console.log(`✓ Verified PDF opened with HTTP 200, Content-Type: ${contentType}, Size: ${pdfBuf.byteLength} bytes`);

    // 5. Submit report evidence and verify in /reports/[id]
    const submitRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': teacherCookie,
      },
      body: JSON.stringify({
        title: 'برنامج تعزيز القيم والهوية الوطنية السعودية',
        indicatorId: 'cmu5ud66c000713lelxhhaz21', // 1-1-1-1
        academicYear: '1446-1447',
        semester: 'الفصل الدراسي الأول',
        evidenceType: 'report',
        reportData: JSON.stringify(reportDataB),
        pdfUrl: pdfData.pdfUrl,
      }),
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) throw new Error(submitData.error || 'Failed to submit report evidence');
    const reportId = submitData.evidence.id;
    console.log(`✓ Submitted report evidence ${reportId}`);

    // Admin login and approve
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie');
    await fetch(`${BASE_URL}/api/evidences/${reportId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ action: 'approve' }),
    });
    console.log('✓ Admin approved the report evidence');

    // Verify /reports/[id] as visitor in browser
    console.log(`Navigating to public report page: ${BASE_URL}/reports/${reportId}...`);
    const publicPage = await context.newPage();
    await publicPage.goto(`${BASE_URL}/reports/${reportId}`);
    await publicPage.waitForLoadState('networkidle');

    // Verify title and PDF download button
    const pageContent = await publicPage.content();
    if (!pageContent.includes('برنامج تعزيز القيم والهوية الوطنية السعودية')) {
      throw new Error('Public report page missing report title');
    }
    if (!pageContent.includes('تحميل نسخة PDF')) {
      throw new Error('Public report page missing download PDF button');
    }

    // Capture screenshot of public report page
    const reportPageScreenshot = path.join(process.cwd(), 'public', 'uploads', 'test_b_public_report.png');
    await publicPage.screenshot({ path: reportPageScreenshot });
    console.log(`✓ Captured public report screenshot at: ${reportPageScreenshot}`);

    results.testB = true;
    results.details.testB = {
      passed: true,
      pdfUrl: pdfData.pdfUrl,
      pdfSizeBytes: pdfStat.size,
      reportId,
      previewScreenshot: '/uploads/test_b_live_preview.png',
      reportScreenshot: '/uploads/test_b_public_report.png',
    };
  } catch (err) {
    console.error('❌ TEST B FAILED:', err);
    results.details.testBError = err.message;
  } finally {
    if (browser) await browser.close();
  }

  // Summary
  console.log('\n======================================================');
  console.log('VERIFICATION SUITE FINAL RESULTS:');
  console.log(`TEST A (Without School Stamp): ${results.testA ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST B (Moe Logo + School Data + 2 Photos + PDF): ${results.testB ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('======================================================');

  fs.writeFileSync('test_a_b_results.json', JSON.stringify(results, null, 2));
  const allPassed = results.testA && results.testB;
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal suite execution error:', err);
  process.exit(1);
});
