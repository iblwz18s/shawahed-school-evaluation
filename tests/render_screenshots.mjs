import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';

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

// Proposed HTML Generator function
function generateReportHtmlProposed({
  reportData,
  indicatorCode = '1-1-1-1',
  indicatorText = 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
  schoolName = 'ابتدائية سعد بن أبي وقاص',
  educationDepartment = 'إدارة التعليم بمنطقة الحدود الشمالية',
  academicYear = '1447-1448هـ / 2026م',
  schoolPrincipal = 'أ. عبد الله بن سعد الغامدي',
  schoolStamp = null,
}) {
  let moeLogoDataUri = null;
  const logoPath = path.join(process.cwd(), 'public', 'images', 'moe-logo.png');
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath);
    moeLogoDataUri = `data:image/png;base64,${buf.toString('base64')}`;
  }

  const images = reportData.images || [];
  const imgCount = images.length;

  const objCount = reportData.objectives?.length || 0;
  const stepsCount = reportData.steps?.length || 0;
  const isTextLong = objCount > 5 || stepsCount > 5 ||
    ((reportData.objectives?.join(' ').length || 0) + (reportData.steps?.join(' ').length || 0) > 450);

  const textGridClass = isTextLong ? 'grid-cols-1' : 'grid-cols-2';

  const isMultiPage = imgCount > 2 || (imgCount > 0 && isTextLong);
  const imagesPerPage = 6;
  const galleryPages = isMultiPage ? Math.ceil(imgCount / imagesPerPage) : 0;
  const totalPages = isMultiPage ? 1 + galleryPages : 1;

  const renderFooter = (pageNumber, total) => `
    <div class="page-footer">
      <div class="signatures-row">
        <div class="signature-block">
          <div class="signature-title">المعلم / المنفذ</div>
          <div class="signature-name">${reportData.executor || '—'}</div>
        </div>
        ${schoolStamp ? `
        <div class="signature-block" style="text-align: center; min-width: 110px;">
          <img src="${schoolStamp}" alt="ختم المدرسة" style="max-height: 70px; max-width: 110px; object-fit: contain; margin: 0 auto; display: block;" />
        </div>` : ''}
        <div class="signature-block">
          <div class="signature-title">مدير المدرسة</div>
          <div class="signature-name">${schoolPrincipal || 'أ. عبد الله بن سعد الغامدي'}</div>
        </div>
      </div>
      <div class="page-number-row">
        <span>شواهد التقويم المدرسي | ${reportData.title}</span>
        <span>صفحة ${pageNumber} من ${total}</span>
      </div>
    </div>
  `;

  const getGalleryGridClass = (count) => {
    if (count <= 2) return 'gallery-cols-2';
    if (count <= 4) return 'gallery-cols-2';
    return 'gallery-cols-3';
  };

  const getGalleryImgHeight = (count) => {
    if (count <= 2) return 'gallery-h-large';
    if (count <= 4) return 'gallery-h-medium';
    return 'gallery-h-compact';
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تقرير توثيق ${reportData.type} - ${reportData.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
      direction: rtl;
      text-align: right;
      color: #0f172a;
      background-color: #e2e8f0;
      line-height: 1.5;
      font-size: 12px;
      -webkit-font-smoothing: antialiased;
      padding: 20px 0;
    }
    .report-document { width: 100%; max-width: 210mm; margin: 0 auto; }
    .report-page {
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      margin: 0 auto 30px auto;
      padding: 10mm 14mm 12mm 14mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
    }
    .page-body { flex: 1 1 auto; display: flex; flex-direction: column; }
    .page-footer { flex-shrink: 0; margin-top: auto; padding-top: 8px; }
    .header-border { border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 12px; }
    .table-meta { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; }
    .table-meta th, .table-meta td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: right; }
    .table-meta th { background-color: #f8fafc; color: #0f766e; font-weight: 700; width: 16%; }
    .table-meta td { background-color: #ffffff; color: #1e293b; }
    .two-col-grid { display: grid; gap: 10px; margin-bottom: 10px; }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .grid-cols-2 { grid-template-columns: 1fr 1fr; }
    .col-box { display: flex; flex-direction: column; }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f766e;
      background-color: #f0fdf9;
      border-right: 3px solid #0f766e;
      padding: 4px 8px;
      margin-bottom: 6px;
      border-radius: 0 4px 4px 0;
    }
    .content-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 11.5px;
      line-height: 1.55;
      flex: 1 1 auto;
    }
    .list-items { padding-right: 16px; margin: 0; }
    .list-items li { margin-bottom: 3px; }
    .inline-images-grid { display: grid; gap: 10px; margin-top: 4px; }
    .inline-img-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center; }
    .inline-img-card img { max-width: 100%; height: 145px; object-fit: contain; border-radius: 4px; background: #f8fafc; }
    .image-caption { font-size: 10px; color: #64748b; margin-top: 4px; }
    .gallery-grid { display: grid; gap: 12px; margin-top: 8px; flex: 1 1 auto; }
    .gallery-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .gallery-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .gallery-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .gallery-card img { max-width: 100%; width: 100%; object-fit: contain; border-radius: 4px; background: #f8fafc; }
    .gallery-h-large { height: 260px; }
    .gallery-h-medium { height: 215px; }
    .gallery-h-compact { height: 170px; }
    .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 6px; font-size: 11.5px; }
    .signature-block { text-align: center; width: 30%; }
    .signature-title { font-weight: 700; color: #334155; margin-bottom: 24px; font-size: 11.5px; }
    .signature-name { font-weight: 600; color: #0f172a; border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 11.5px; }
    .page-number-row { display: flex; justify-content: space-between; font-size: 9.5px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 3px; }
    .header-compact { border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="report-document">
    <div class="report-page page-1">
      <div class="page-body">
        <div class="header-border">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 33%; text-align: right; border: none; vertical-align: middle;">
                <div style="font-weight: 700; color: #0f172a; font-size: 12px; line-height: 1.4;">المملكة العربية السعودية</div>
                <div style="font-weight: 600; color: #1e293b; font-size: 11.5px; line-height: 1.4;">وزارة التعليم</div>
                <div style="color: #475569; font-size: 11px; line-height: 1.4;">${educationDepartment}</div>
                <div style="font-weight: 700; color: #0f766e; font-size: 12px; line-height: 1.4; margin-top: 2px;">${schoolName}</div>
              </td>
              <td style="width: 34%; text-align: center; border: none; vertical-align: middle;">
                ${moeLogoDataUri ? `
                  <img
                    src="${moeLogoDataUri}"
                    alt="شعار وزارة التعليم"
                    style="height: 85px; max-width: 220px; object-fit: contain; margin: 0 auto; display: block;"
                  />
                ` : ''}
              </td>
              <td style="width: 33%; text-align: left; border: none; vertical-align: middle;">
                <div style="display: inline-block; text-align: left;">
                  <div style="background-color: #f0fdf9; border: 1px solid #99f6e0; border-radius: 8px; padding: 5px 12px; margin-bottom: 4px; text-align: center;">
                    <div style="font-size: 9.5px; font-weight: 700; color: #0f766e;">شواهد التقويم المدرسي</div>
                    <div style="font-size: 13px; font-weight: 800; color: #042f2c;">توثيق ${reportData.type}</div>
                    <div style="font-size: 9.5px; color: #64748b;">العام: ${academicYear}</div>
                  </div>
                  ${indicatorCode ? `
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 8px; text-align: center;">
                    <span style="font-size: 9px; color: #64748b;">المؤشر: </span>
                    <span style="font-family: monospace; font-weight: 700; color: #0f766e; font-size: 11px; direction: ltr; display: inline-block;">${indicatorCode}</span>
                  </div>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <table class="table-meta">
          <tr>
            <th>اسم ${reportData.type}</th>
            <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
          </tr>
          <tr>
            <th>نوع التنفيذ</th>
            <td>${reportData.type}</td>
            <th>تاريخ التنفيذ</th>
            <td>${reportData.date || '—'}</td>
          </tr>
          <tr>
            <th>المنفذ / المشرف</th>
            <td style="font-weight: 600;">${reportData.executor || '—'}</td>
            <th>الفئة المستهدفة</th>
            <td>${reportData.audience || 'جميع الطلاب'}</td>
          </tr>
          <tr>
            <th>عدد المستفيدين</th>
            <td>${reportData.beneficiariesCount || '—'}</td>
            <th>العام الدراسي</th>
            <td>${academicYear}</td>
          </tr>
          ${indicatorText ? `
          <tr>
            <th>نص المؤشر</th>
            <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
          </tr>` : ''}
        </table>

        <div class="two-col-grid ${textGridClass}">
          ${reportData.objectives && reportData.objectives.length > 0 ? `
          <div class="col-box">
            <div class="section-title">أهداف ${reportData.type}</div>
            <div class="content-box">
              <ul class="list-items">
                ${reportData.objectives.map(obj => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
          </div>` : ''}

          ${reportData.steps && reportData.steps.length > 0 ? `
          <div class="col-box">
            <div class="section-title">خطوات وإجراءات التنفيذ</div>
            <div class="content-box">
              <ol class="list-items" style="list-style-type: decimal;">
                ${reportData.steps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
          </div>` : ''}
        </div>

        ${(reportData.outcomes && reportData.outcomes.length > 0) || reportData.notes ? `
        <div class="two-col-grid ${(reportData.outcomes && reportData.outcomes.length > 0 && reportData.notes) ? 'grid-cols-2' : 'grid-cols-1'}">
          ${reportData.outcomes && reportData.outcomes.length > 0 ? `
          <div class="col-box">
            <div class="section-title">النتائج ومؤشرات الأثر</div>
            <div class="content-box">
              <ul class="list-items">
                ${reportData.outcomes.map(out => `<li>${out}</li>`).join('')}
              </ul>
            </div>
          </div>` : ''}

          ${reportData.notes ? `
          <div class="col-box">
            <div class="section-title">ملاحظات وتوصيات إضافية</div>
            <div class="content-box">
              <p>${reportData.notes}</p>
            </div>
          </div>` : ''}
        </div>` : ''}

        ${!isMultiPage && imgCount > 0 ? `
        <div style="margin-top: 4px;">
          <div class="section-title">شواهد التوثيق المصور (${imgCount} صور)</div>
          <div class="inline-images-grid" style="grid-template-columns: repeat(${imgCount === 1 ? '1' : '2'}, 1fr);">
            ${images.map((img, idx) => `
              <div class="inline-img-card">
                <img src="${img.url}" alt="شاهد ${idx + 1}" />
                ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${isMultiPage ? `
        <div style="margin-top: 8px; background-color: #f0fdf9; border: 1px dashed #0f766e; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 11px; font-weight: 600; color: #0f766e;">
            📷 يتضمن التقرير ملحقاً لشواهد التوثيق المصور (${imgCount} صور) مُرفق بالصفحة التالية.
          </div>
          <div style="font-size: 10.5px; color: #64748b;">
            تابع الصفحة 2 ⬅
          </div>
        </div>` : ''}
      </div>

      ${renderFooter(1, totalPages)}
    </div>

    ${isMultiPage ? Array.from({ length: galleryPages }).map((_, pageIdx) => {
      const pageNum = 2 + pageIdx;
      const startIdx = pageIdx * imagesPerPage;
      const pageImages = images.slice(startIdx, startIdx + imagesPerPage);
      const gridCls = getGalleryGridClass(pageImages.length);
      const heightCls = getGalleryImgHeight(pageImages.length);

      return `
      <div class="report-page page-${pageNum}">
        <div class="page-body">
          <div class="header-compact">
            <table style="width: 100%; border: none; border-collapse: collapse;">
              <tr>
                <td style="width: 35%; text-align: right; border: none; vertical-align: middle;">
                  <div style="font-weight: 700; color: #0f766e; font-size: 11.5px;">${schoolName}</div>
                  <div style="color: #64748b; font-size: 10.5px;">${educationDepartment}</div>
                </td>
                <td style="width: 30%; text-align: center; border: none; vertical-align: middle;">
                  ${moeLogoDataUri ? `<img src="${moeLogoDataUri}" alt="شعار وزارة التعليم" style="height: 52px; max-width: 140px; object-fit: contain; margin: 0 auto; display: block;" />` : ''}
                </td>
                <td style="width: 35%; text-align: left; border: none; vertical-align: middle;">
                  <div style="font-size: 11px; font-weight: 700; color: #0f766e;">ملحق شواهد التوثيق المصور</div>
                  <div style="font-size: 10px; color: #475569; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${reportData.title}</div>
                  ${indicatorCode ? `<div style="font-size: 9.5px; color: #64748b; font-family: monospace; direction: ltr;">المؤشر: ${indicatorCode}</div>` : ''}
                </td>
              </tr>
            </table>
          </div>

          <div class="section-title" style="margin-bottom: 8px;">
            شواهد التوثيق والفعاليات المصورة (${startIdx + 1} - ${startIdx + pageImages.length} من إجمالي ${imgCount} صور)
          </div>

          <div class="gallery-grid ${gridCls}">
            ${pageImages.map((img, idx) => `
              <div class="gallery-card">
                <img src="${img.url}" alt="شاهد ${startIdx + idx + 1}" class="${heightCls}" />
                ${img.caption ? `<div class="image-caption" style="font-size: 11px; font-weight: 500; color: #334155; margin-top: 6px;">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        ${renderFooter(pageNum, totalPages)}
      </div>
      `;
    }).join('') : ''}
  </div>
</body>
</html>`;
}

async function render() {
  console.log('Generating screenshots for all 3 cases...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  const img1 = await makeImage('شاهد 1: انطلاق الفعالية', 'حضور الطلاب والترحيب', '#0f766e');
  const img2 = await makeImage('شاهد 2: ورشة العمل التفاعلية', 'تطبيق الأنشطة التعليمية', '#1e40af');
  const img3 = await makeImage('شاهد 3: العرض التقديمي', 'مشاركة الطلاب المبدعين', '#b45309');
  const img4 = await makeImage('شاهد 4: المعرض والإنتاج', 'نماذج من مخرجات المبادرة', '#4338ca');
  const img5 = await makeImage('شاهد 5: التقييم والتحكيم', 'لجنة التحكيم المدرسية', '#047857');
  const img6 = await makeImage('شاهد 6: التكريم والختام', 'تسليم شهادات الشكر والجوائز', '#be123c');

  // Case 1
  const html1 = generateReportHtmlProposed({
    reportData: {
      title: 'برنامج تعزيز مهارات القراءة والكتابة',
      type: 'برنامج',
      executor: 'أ. فهد بن ناصر القحطاني',
      date: '1446/04/12هـ',
      audience: 'طلاب المرحلة الابتدائية',
      beneficiariesCount: '120 طالب',
      objectives: ['رفع المستوى التحصيلي للطلاب في مهارات الفهم القرائي.', 'تنمية شغف القراءة الحرة والمطالعة الذاتية.'],
      steps: ['حصر الطلاب وتحديد المستويات القرائية المستهدفة.', 'تنفيذ ورش قرائية يومية في مركز مصادر التعلم.'],
      outcomes: ['تحسن ملموس بنسبة 85% في طلاقة القراءة لدى العينة المستهدفة.'],
      notes: 'يوصى باستمرار البرنامج خلال الفصل الدراسي القادم.',
      images: [
        { url: img1, caption: 'الورشة القرائية الأولى' },
        { url: img2, caption: 'الطلاب أثناء القراءة الحرة' },
      ],
    }
  });
  await page.setContent(html1, { waitUntil: 'networkidle' });
  const el1 = page.locator('.report-page.page-1');
  await el1.screenshot({ path: 'public/uploads/case_1_preview.png' });
  console.log('✓ Saved: public/uploads/case_1_preview.png');

  // Case 2
  const html2 = generateReportHtmlProposed({
    reportData: {
      title: 'مبادرة السلامة المدرسية والإخلاء الفرضي',
      type: 'مبادرة',
      executor: 'أ. عبد العزيز بن سالم العنزي',
      date: '1446/05/18هـ',
      audience: 'كافة منسوبي المدرسة والطلاب',
      beneficiariesCount: '340 مستفيد',
      objectives: [
        'تدريب الطلاب ومنسوبي المدرسة على خطة الإخلاء الآمن.',
        'التحقق من جاهزية مخارج الطوارئ وأدوات الإطفاء والسلامة.',
        'نشر ثقافة السلامة والوقاية من المخاطر البيئية.'
      ],
      steps: [
        'تحديد مسارات الإخلاء وتوزيع نقاط التجمع في الفناء المدرسي.',
        'إطلاق جرس الإنذار وتنفيذ فرضية الإخلاء في زمن قياسي.',
        'حصر الحضور في نقطة التجمع والتأكد من سلامة الجميع.'
      ],
      outcomes: [
        'إخلاء المبنى بالكامل دون أي إصابات في زمن قياسي.',
        'إكساب الطلاب مهارات التعامل الهادئ والسريع مع الإنذارات.'
      ],
      notes: 'تمت الفرضية بالتنسيق والمتابعة مع الدفاع المدني.',
      images: [
        { url: img1, caption: 'انطلاق صفارات الإنذار والإخلاء' },
        { url: img2, caption: 'مسارات الخروج المنتظمة' },
        { url: img3, caption: 'نقطة التجمع في الساحة الخارجية' },
        { url: img4, caption: 'التدريب على طفايات الحريق' },
      ],
    }
  });
  await page.setContent(html2, { waitUntil: 'networkidle' });
  await page.locator('.report-page.page-1').screenshot({ path: 'public/uploads/case_2_page1_preview.png' });
  await page.locator('.report-page.page-2').screenshot({ path: 'public/uploads/case_2_page2_preview.png' });
  console.log('✓ Saved: public/uploads/case_2_page1_preview.png & case_2_page2_preview.png');

  // Case 3
  const html3 = generateReportHtmlProposed({
    reportData: {
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
        { url: img1, caption: 'حفل افتتاح ملتقى الابتكار' },
        { url: img2, caption: 'جناح مشروعات الروبوت والبرمجة' },
        { url: img3, caption: 'ورشة الذكاء الاصطناعي التفاعلية' },
        { url: img4, caption: 'تفاعل أولياء الأمور والطلاب' },
        { url: img5, caption: 'لجنة التحكيم تقيّم الابتكارات' },
        { url: img6, caption: 'تكريم المشروعات الفائزة في الحفل الختامي' },
      ],
    }
  });
  await page.setContent(html3, { waitUntil: 'networkidle' });
  await page.locator('.report-page.page-1').screenshot({ path: 'public/uploads/case_3_page1_preview.png' });
  await page.locator('.report-page.page-2').screenshot({ path: 'public/uploads/case_3_page2_preview.png' });
  console.log('✓ Saved: public/uploads/case_3_page1_preview.png & case_3_page2_preview.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

render().catch(console.error);
