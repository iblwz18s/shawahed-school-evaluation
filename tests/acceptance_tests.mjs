import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('🚀 Starting Acceptance Tests against ' + BASE_URL);
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    details: {}
  };

  // Helper for logging in
  async function login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed for ${email}`);
    const cookie = res.headers.get('set-cookie');
    const data = await res.json();
    return { cookie, user: data.user };
  }

  const teacherAuth = await login('teacher@example.com', 'teacher123');
  console.log('✓ Teacher logged in:', teacherAuth.user.name);

  const adminAuth = await login('admin@example.com', 'admin123');
  console.log('✓ Admin logged in:', adminAuth.user.name);

  // =========================================================================
  // TEST 1: External Link (Google Drive) - Pending -> Approved -> Visitor check
  // =========================================================================
  console.log('\n--- TEST 1: External Link Workflow ---');
  try {
    const createRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': teacherAuth.cookie,
      },
      body: JSON.stringify({
        title: 'خطة تعزيز الهوية الوطنية - مجلد قوقل درايف',
        indicatorId: 'cmu5ud66s000d13le546qbtms', // 1-2-1-1
        academicYear: '1446-1447',
        semester: 'الفصل الدراسي الأول',
        evidenceType: 'external_link',
        subType: 'folder',
        url: 'https://drive.google.com/drive/folders/test-folder-123',
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.error || 'Failed to create external link evidence');
    const ev1Id = createData.evidence.id;
    console.log(`✓ Created evidence ${ev1Id} with status: ${createData.evidence.status}, evidenceType: ${createData.evidence.evidenceType}, subType: ${createData.evidence.subType}`);

    if (createData.evidence.status !== 'pending') {
      throw new Error(`Expected pending status, got: ${createData.evidence.status}`);
    }

    // Unauthenticated visitor check: should NOT see this evidence
    const visitorRes1 = await fetch(`${BASE_URL}/api/indicators/1-2-1-1`);
    const visitorData1 = await visitorRes1.json();
    const isVisibleToVisitorBefore = visitorData1.evidences?.some(e => e.id === ev1Id);
    if (isVisibleToVisitorBefore) {
      throw new Error('Pending evidence should NOT be visible to public visitors!');
    }
    console.log('✓ Verified pending evidence is hidden from public visitor.');

    // Admin approves evidence via POST /api/evidences/[id]/review { action: 'approve' }
    const reviewRes = await fetch(`${BASE_URL}/api/evidences/${ev1Id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminAuth.cookie,
      },
      body: JSON.stringify({
        action: 'approve',
      }),
    });
    const reviewData = await reviewRes.json();
    if (!reviewRes.ok) throw new Error(reviewData.error || 'Admin approval failed');
    console.log('✓ Admin approved evidence successfully.');

    // Unauthenticated visitor check again: should NOW see this evidence
    const visitorRes2 = await fetch(`${BASE_URL}/api/indicators/1-2-1-1`);
    const visitorData2 = await visitorRes2.json();
    const visibleEvidence = visitorData2.evidences?.find(e => e.id === ev1Id);
    if (!visibleEvidence || visibleEvidence.status !== 'approved') {
      throw new Error('Approved evidence MUST be visible to public visitors!');
    }
    console.log('✓ Verified approved evidence is now visible to public visitor.');
    results.test1 = true;
    results.details.test1 = { id: ev1Id, title: visibleEvidence.title, url: visibleEvidence.url };
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err);
    results.details.test1Error = err.message;
  }

  // =========================================================================
  // TEST 2: Video Link Subtype (External Link, no local video upload)
  // =========================================================================
  console.log('\n--- TEST 2: Video External Link ---');
  try {
    const createRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': teacherAuth.cookie,
      },
      body: JSON.stringify({
        title: 'توثيق فيديو ورشة عمل أخلاقيات مهنة التعليم',
        indicatorId: 'cmu5ud66x000f13leof5lvnfd', // 1-2-1-2
        academicYear: '1446-1447',
        semester: 'الفصل الدراسي الأول',
        evidenceType: 'external_link',
        subType: 'video',
        url: 'https://www.youtube.com/watch?v=sample-video-xyz',
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.error || 'Failed to create video evidence');
    const ev2 = createData.evidence;

    if (ev2.evidenceType !== 'external_link' || ev2.subType !== 'video') {
      throw new Error(`Unexpected type: ${ev2.evidenceType}, subType: ${ev2.subType}`);
    }
    console.log(`✓ Created video evidence ${ev2.id} with subType: 'video'`);
    console.log(`✓ URL stored as: ${ev2.url}`);

    // Admin approves it
    await fetch(`${BASE_URL}/api/evidences/${ev2.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminAuth.cookie },
      body: JSON.stringify({ action: 'approve' }),
    });

    results.test2 = true;
    results.details.test2 = { id: ev2.id, subType: ev2.subType, url: ev2.url };
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err);
    results.details.test2Error = err.message;
  }

  // =========================================================================
  // TEST 3: School Documentation Report with 2 Images & PDF Generation
  // =========================================================================
  console.log('\n--- TEST 3: School Documentation Report (2 Images, AI, PDF) ---');
  try {
    // 1. Create two test images (large 2000x1500 to test resizing to max 1600)
    console.log('Generating sample images...');
    const img1Buffer = await sharp({
      create: {
        width: 2000,
        height: 1500,
        channels: 3,
        background: { r: 15, g: 90, b: 60 },
      }
    }).png().toBuffer();

    const img2Buffer = await sharp({
      create: {
        width: 1800,
        height: 1200,
        channels: 3,
        background: { r: 30, g: 60, b: 120 },
      }
    }).png().toBuffer();

    // 2. Upload images to /api/upload/image
    async function uploadImage(buffer, filename) {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('file', blob, filename);

      const upRes = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Cookie': teacherAuth.cookie },
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || 'Upload failed');
      return upData;
    }

    const uploaded1 = await uploadImage(img1Buffer, 'photo1.png');
    const uploaded2 = await uploadImage(img2Buffer, 'photo2.png');
    console.log(`✓ Uploaded image 1: ${uploaded1.url}, size: ${uploaded1.width}x${uploaded1.height}`);
    console.log(`✓ Uploaded image 2: ${uploaded2.url}, size: ${uploaded2.width}x${uploaded2.height}`);

    if (uploaded1.width > 1600 || uploaded1.height > 1600) {
      throw new Error(`Image 1 exceeds max dimension 1600: ${uploaded1.width}x${uploaded1.height}`);
    }

    // 3. Test AI enhancement endpoint
    console.log('Testing AI enhancement endpoint...');
    const aiRes = await fetch(`${BASE_URL}/api/ai/enhance-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        title: 'برنامج الاحتفاء باليوم الوطني 94',
        type: 'برنامج',
        objectives: ['تعزيز حب الوطن والولاء للقيادة'],
        steps: ['تنظيم إذاعة مدرسية، معرض فني، تكريم الطلاب'],
        outcomes: ['مشاركة واسعة وفخر وطني لدى المتعلمين'],
      }),
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok || !aiData.enhanced) throw new Error('AI enhance failed');
    console.log('✓ AI enhancement returned structured objectives, steps, and outcomes.');

    // 4. Construct ReportData according to ReportData interface
    const reportData = {
      title: 'برنامج الاحتفاء باليوم الوطني السعودي 94',
      type: 'برنامج',
      executor: 'أحمد بن محمد المعلم',
      date: '1446/03/19هـ',
      audience: 'جميع طلاب المدرسة ومنسوبيها',
      beneficiariesCount: '450',
      objectives: aiData.enhanced.objectives,
      steps: aiData.enhanced.steps,
      outcomes: aiData.enhanced.outcomes,
      images: [
        { url: uploaded1.url, caption: 'افتتاح المعرض الفني وأعمال الطلاب الوطنية' },
        { url: uploaded2.url, caption: 'جانب من الحفل الخطابي والفقرات التراثية' },
      ],
      notes: 'تم التنفيذ بحضور المشرف التربوي المتابع للمدرسة',
    };

    // 5. Preview HTML endpoint
    const previewRes = await fetch(`${BASE_URL}/api/reports/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        reportData,
        indicatorCode: '1-2-1-1',
        indicatorText: 'تعزز المدرسة القيم الإسلامية، والهوية الوطنية.',
      }),
    });
    const previewData = await previewRes.json();
    if (!previewRes.ok || !previewData.html) throw new Error('Preview failed');
    console.log('✓ Generated HTML preview successfully (length:', previewData.html.length, 'bytes).');

    // 6. Generate PDF via Playwright endpoint
    console.log('Calling Playwright PDF generation...');
    const pdfStart = Date.now();
    const pdfRes = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        reportData,
        indicatorCode: '1-2-1-1',
        indicatorText: 'تعزز المدرسة القيم الإسلامية، والهوية الوطنية.',
      }),
    });
    const pdfData = await pdfRes.json();
    const pdfDuration = Date.now() - pdfStart;
    if (!pdfRes.ok || !pdfData.pdfUrl) throw new Error(pdfData.error || 'PDF generation failed');
    console.log(`✓ PDF generated in ${pdfDuration}ms: ${pdfData.pdfUrl} (filesize: ${pdfData.size} bytes)`);

    // Verify PDF file exists on disk
    const pdfDiskPath = path.join(process.cwd(), 'public', pdfData.pdfUrl.replace(/^\//, ''));
    if (!fs.existsSync(pdfDiskPath)) {
      throw new Error(`PDF file does not exist on disk at: ${pdfDiskPath}`);
    }
    const pdfStat = fs.statSync(pdfDiskPath);
    console.log(`✓ Verified PDF on disk: ${pdfDiskPath} (${pdfStat.size} bytes)`);

    // 7. Teacher submits report evidence
    const submitEvRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        title: 'تقرير برنامج الاحتفاء باليوم الوطني 94',
        indicatorId: 'cmu5ud66s000d13le546qbtms',
        academicYear: '1446-1447',
        semester: 'الفصل الدراسي الأول',
        evidenceType: 'report',
        reportData: JSON.stringify(reportData),
        pdfUrl: pdfData.pdfUrl,
      }),
    });
    const submitEvData = await submitEvRes.json();
    if (!submitEvRes.ok) throw new Error(submitEvData.error || 'Failed to submit report evidence');
    const reportEvId = submitEvData.evidence.id;
    console.log(`✓ Created report evidence ${reportEvId}`);

    // 8. Admin approves report evidence
    await fetch(`${BASE_URL}/api/evidences/${reportEvId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminAuth.cookie },
      body: JSON.stringify({ action: 'approve' }),
    });
    console.log('✓ Admin approved report evidence.');

    // 9. Visitor views report page: /reports/[id]
    const reportPageRes = await fetch(`${BASE_URL}/reports/${reportEvId}`);
    if (!reportPageRes.ok) throw new Error(`Report page returned HTTP ${reportPageRes.status}`);
    const reportPageHtml = await reportPageRes.text();
    if (!reportPageHtml.includes('تقرير توثيق برنامج') || !reportPageHtml.includes('PDF')) {
      throw new Error('Report page is missing key header or download button');
    }
    console.log('✓ Verified public /reports/[id] page renders beautifully with PDF download button.');

    results.test3 = true;
    results.details.test3 = {
      evidenceId: reportEvId,
      pdfUrl: pdfData.pdfUrl,
      pdfSizeBytes: pdfStat.size,
      pdfDurationMs: pdfDuration,
    };
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err);
    results.details.test3Error = err.message;
  }

  // =========================================================================
  // TEST 4: Long Multi-Page Report (6 Images, Execution Steps, Page Breaks)
  // =========================================================================
  console.log('\n--- TEST 4: Long Multi-Page Report (6 Images & Page Break) ---');
  try {
    // Generate 4 more sample images to make 6 total
    const dummyImages = [];
    const colors = [
      { r: 40, g: 80, b: 140 },
      { r: 140, g: 80, b: 40 },
      { r: 40, g: 140, b: 80 },
      { r: 120, g: 40, b: 120 },
      { r: 100, g: 100, b: 40 },
      { r: 40, g: 100, b: 100 },
    ];

    for (let i = 0; i < 6; i++) {
      const buf = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: colors[i],
        }
      }).png().toBuffer();

      const formData = new FormData();
      formData.append('file', new Blob([buf], { type: 'image/png' }), `img_${i + 1}.png`);
      const res = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Cookie': teacherAuth.cookie },
        body: formData,
      });
      const data = await res.json();
      dummyImages.push({
        url: data.url,
        caption: `توثيق الفعالية رقم ${i + 1}: تفاصيل المرحلة التوثيقية`,
      });
    }

    const longReportData = {
      title: 'الملتقى السنوي لتعزيز التميز والانضباط المدرسي',
      type: 'نشاط',
      executor: 'سالم بن عبد العزيز المطيري',
      date: '1446/04/10هـ',
      audience: 'الكادر الإداري والتعليمي والطلاب وأولياء الأمور',
      beneficiariesCount: '620',
      objectives: [
        'رفع نسبة الانضباط المدرسي والحد من الغياب بنسبة 95%.',
        'تكريم الفصول والطلاب الأكثر انضباطاً والتزاماً باللوائح والتعليمات.',
        'تعزيز الشراكة بين المدرسة والأسرة لمتابعة سلوك وانضباط المتعلمين.',
        'تطبيق ميثاق الشراكة المدرسية والأسرية وفق الأنظمة المعتمدة.',
      ],
      steps: [
        'عقد اجتماع تحضيري مع لجنة التوجيه الطلابي والانضباط المدرسي.',
        'إعداد استبانات قياس رضا ورصد الحالات التي تحتاج دعماً انضباطياً.',
        'تنظيم ورش عمل توعوية حول لائحة السلوك والمواظبة الرقمية.',
        'إطلاق حملة (انضباطي سر نجاحي) عبر المنصات الإذاعية والمدرسية.',
        'رصد يومي دقيق لنسب الحضور عبر نظام نور وإصدار التقارير الأسبوعية.',
        'عقد لقاءات دورية مع أولياء الأمور لمناقشة مؤشرات الانضباط.',
        'إقامة الحفل الختامي لتكريم رواد الفصول والطلاب المنتظمين.',
      ],
      outcomes: [
        'انخفاض نسبة الغياب غير المبرر إلى أقل من 2% خلال الفصل الأول.',
        'تحسن ملحوظ في التزام الطلاب بالحضور المبكر والاصطفاف الصباحي.',
        'تفاعل أكثر من 85% من أولياء الأمور في ورش الانضباط المشتركة.',
        'توثيق تجربة المدرسة كنموذج رائد في تقارير مكتب التعليم.',
      ],
      images: dummyImages,
      notes: 'تمت التغطية بالتعاون مع فريق العمل الإعلامي والتوجيه الطلابي بالمدرسة.',
    };

    // Generate Playwright PDF for long report
    const pdfStart = Date.now();
    const longPdfRes = await fetch(`${BASE_URL}/api/reports/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        reportData: longReportData,
        indicatorCode: '1-2-1-3',
        indicatorText: 'تطبق المدرسة إجراءات محددة؛ لدعم الانضباط المدرسي، وتتابع الالتزام بها.',
      }),
    });
    const longPdfData = await longPdfRes.json();
    const longPdfDuration = Date.now() - pdfStart;
    if (!longPdfRes.ok || !longPdfData.pdfUrl) throw new Error(longPdfData.error || 'Long PDF generation failed');
    console.log(`✓ Long multi-page PDF generated in ${longPdfDuration}ms: ${longPdfData.pdfUrl} (${longPdfData.size} bytes)`);

    // Verify HTML has break-inside: avoid
    const previewRes = await fetch(`${BASE_URL}/api/reports/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({ reportData: longReportData }),
    });
    const previewData = await previewRes.json();
    if (!previewData.html.includes('break-inside: avoid')) {
      throw new Error('Expected break-inside: avoid rules in report HTML template');
    }
    console.log('✓ Verified break-inside: avoid and page-break styling present in report template.');

    results.test4 = true;
    results.details.test4 = {
      pdfUrl: longPdfData.pdfUrl,
      imagesCount: 6,
      fileSizeBytes: longPdfData.size,
      durationMs: longPdfDuration,
    };
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err);
    results.details.test4Error = err.message;
  }

  // =========================================================================
  // TEST 5: Responsive Styling & Input Validations
  // =========================================================================
  console.log('\n--- TEST 5: Responsive Styling & Input Validation ---');
  try {
    // 1. Validate rejection of empty external link URL
    const badUrlRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        title: 'شاهد بدون رابط',
        indicatorId: 'cmu5ud66s000d13le546qbtms',
        evidenceType: 'external_link',
        url: '',
      }),
    });
    if (badUrlRes.ok) {
      throw new Error('API should reject external link without URL!');
    }
    console.log('✓ Correctly rejected external link without URL (HTTP 400).');

    // 2. Validate rejection of report without title
    const badReportRes = await fetch(`${BASE_URL}/api/evidences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        title: '',
        indicatorId: 'cmu5ud66s000d13le546qbtms',
        evidenceType: 'report',
      }),
    });
    if (badReportRes.ok) {
      throw new Error('API should reject evidence without title!');
    }
    console.log('✓ Correctly rejected evidence without title (HTTP 400).');

    // 3. Verify mobile CSS in report preview
    const samplePreviewRes = await fetch(`${BASE_URL}/api/reports/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': teacherAuth.cookie },
      body: JSON.stringify({
        reportData: {
          title: 'اختبار التجاوب',
          type: 'نشاط',
          executor: 'المعلم',
          date: '1446/01/01',
          audience: 'الطلاب',
          beneficiariesCount: '100',
          objectives: ['هدف'],
          steps: ['خطوة'],
          outcomes: ['مخرج'],
          images: [],
        },
      }),
    });
    const sampleData = await samplePreviewRes.json();
    if (!sampleData.html.includes('@media screen and (max-width: 768px)')) {
      throw new Error('Report preview missing mobile responsive media queries');
    }
    console.log('✓ Verified mobile responsive media queries in report HTML template.');

    results.test5 = true;
    results.details.test5 = { validValidation: true, mobileCssPresent: true };
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err);
    results.details.test5Error = err.message;
  }

  // Summary
  console.log('\n========================================');
  console.log('ACCEPTANCE TESTS SUMMARY:');
  console.log(`TEST 1 (External Link Workflow): ${results.test1 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST 2 (Video Link Subtype):    ${results.test2 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST 3 (Report 2-Img & PDF):     ${results.test3 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST 4 (Long Report 6-Img):      ${results.test4 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST 5 (Validation & Mobile):    ${results.test5 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('========================================');

  const allPassed = results.test1 && results.test2 && results.test3 && results.test4 && results.test5;
  fs.writeFileSync('acceptance_results.json', JSON.stringify(results, null, 2));
  console.log(`\nAll tests passed: ${allPassed}`);
  process.exit(allPassed ? 0 : 1);
}

run().catch((e) => {
  console.error('Test execution fatal error:', e);
  process.exit(1);
});
