import { ReportData } from '@/types';
import fs from 'fs';
import path from 'path';
import { formatHijriOnly, formatAcademicYearOnly, toArabicDigits } from './hijri-date';

interface GenerateReportHtmlParams {
  reportData: ReportData;
  indicatorCode?: string;
  indicatorText?: string;
  schoolName?: string;
  educationDepartment?: string;
  academicYear?: string;
  baseUrl?: string;
  schoolPrincipal?: string;
  schoolStamp?: string | null;
  ministryLogoUrl?: string | null;
}

function getLocalImageAsDataUri(relativeOrAbsoluteUrl: string): string | null {
  if (!relativeOrAbsoluteUrl) return null;
  if (relativeOrAbsoluteUrl.startsWith('data:')) return relativeOrAbsoluteUrl;
  try {
    const isWindowsAbsoluteWithDrive = /^[a-zA-Z]:[\\\/]/.test(relativeOrAbsoluteUrl);
    const localPath = isWindowsAbsoluteWithDrive
      ? relativeOrAbsoluteUrl
      : path.join(process.cwd(), 'public', relativeOrAbsoluteUrl.replace(/^[\/\\]+/, ''));

    if (fs.existsSync(localPath)) {
      const ext = path.extname(localPath).toLowerCase().replace('.', '');
      let mime = 'image/png';
      if (ext === 'webp') mime = 'image/webp';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'svg') mime = 'image/svg+xml';
      const buf = fs.readFileSync(localPath);
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    console.error('Error converting image to data URI:', err);
  }
  return null;
}

export function generateReportHtml({
  reportData,
  indicatorCode = '',
  indicatorText = '',
  schoolName = 'ابتدائية سعد بن أبي وقاص',
  educationDepartment = 'إدارة التعليم بمنطقة الحدود الشمالية',
  academicYear = '١٤٤٧-١٤٤٨هـ',
  baseUrl = '',
  schoolPrincipal = '',
  schoolStamp = null,
  ministryLogoUrl = '/images/moe-logo.png',
}: GenerateReportHtmlParams): string {
  const images = reportData.images || [];
  const imgCount = images.length;

  const reportType = reportData.reportType || 'program_activity';

  // تحديد المسميات والنصوص بناء على نوع التقرير المختار
  let badgeTitle = `توثيق ${reportData.type || 'برنامج'}`;
  let titleLabel = `اسم ${reportData.type || 'البرنامج'}`;
  let executorLabel = 'المنفذ / المشرف';
  let secATitle = `أهداف ${reportData.type || 'البرنامج'}`;
  let secBTitle = 'خطوات وإجراءات التنفيذ';
  let secCTitle = 'النتائج ومؤشرات الأثر';
  let secDTitle = 'ملاحظات وتوصيات إضافية';

  switch (reportType) {
    case 'teaching_strategy':
      badgeTitle = 'توثيق استراتيجية تدريس';
      titleLabel = 'اسم الاستراتيجية';
      executorLabel = 'المعلم المنفذ';
      secATitle = 'أهداف تطبيق الاستراتيجية';
      secBTitle = 'خطوات التطبيق داخل الصف';
      secCTitle = 'مخرجات التعلم وأثر الاستراتيجية';
      secDTitle = 'ملاحظات المعلم وتوصياته';
      break;
    case 'school_initiative':
      badgeTitle = 'توثيق مبادرة مدرسية';
      titleLabel = 'اسم المبادرة';
      executorLabel = 'صاحب / فريق المبادرة';
      secATitle = 'أهداف المبادرة';
      secBTitle = 'مراحل وخطوات التنفيذ';
      secCTitle = 'المخرجات والنتائج المحققة';
      secDTitle = 'توصيات الاستدامة والتطوير';
      break;
    case 'training_workshop':
      badgeTitle = 'توثيق دورة / ورشة عمل';
      titleLabel = 'عنوان الدورة / الورشة';
      executorLabel = 'المدرب / مقدم الورشة';
      secATitle = 'أهداف الورشة التدريبية';
      secBTitle = 'محاور التدريب وخطة العمل';
      secCTitle = 'مخرجات التدريب والمكتسبات';
      secDTitle = 'ملاحظات وتقييم الورشة';
      break;
    case 'meeting':
      badgeTitle = 'توثيق اجتماع / لقاء';
      titleLabel = 'عنوان الاجتماع';
      executorLabel = 'رئيس / منسق الاجتماع';
      secATitle = 'محاور الاجتماع وجدول الأعمال';
      secBTitle = 'أبرز ما تم مناقشته خلال اللقاء';
      secCTitle = 'القرارات والتوصيات المعتمدة';
      secDTitle = 'موعد الاجتماع القادم والملاحظات';
      break;
    case 'occasion':
      badgeTitle = 'توثيق مناسبة / يوم عالمي';
      titleLabel = 'اسم المناسبة / الفعالية';
      executorLabel = 'المشرف على الفعالية';
      secATitle = 'أهداف تفعيل المناسبة';
      secBTitle = 'الفعاليات والأنشطة المنفذة';
      secCTitle = 'تفاعل الطلاب ومؤشرات المشاركة';
      secDTitle = 'أثر التفعيل وكلمة ختامية';
      break;
    case 'classroom_visit':
      badgeTitle = 'توثيق زيارة صفية';
      titleLabel = 'موضوع الدرس / عنوان الزيارة';
      executorLabel = 'المعلم المزار';
      secATitle = 'أهداف الزيارة الصفية';
      secBTitle = 'الممارسات التدريسية المتميزة الملاحظة';
      secCTitle = 'الملاحظات التطويرية المشتركة';
      secDTitle = 'التوصيات وخطة نقل الخبرة';
      break;
    case 'results_analysis':
      badgeTitle = 'توثيق تحليل نتائج';
      titleLabel = 'اسم المادة / الاختبار';
      executorLabel = 'المعلم المحلل';
      secATitle = 'نقاط القوة الملاحظة في النتائج';
      secBTitle = 'الفجوات ونقاط الضعف التعليمية';
      secCTitle = 'الإجراءات والخطط العلاجية المنفذة';
      secDTitle = 'مؤشرات التحسن وتوصيات المتابعة';
      break;
    case 'program_activity':
    default:
      badgeTitle = `توثيق ${reportData.type || 'برنامج'}`;
      titleLabel = `اسم ${reportData.type || 'البرنامج'}`;
      executorLabel = 'المنفذ / المشرف';
      secATitle = `أهداف ${reportData.type || 'البرنامج'}`;
      secBTitle = 'خطوات وإجراءات التنفيذ';
      secCTitle = 'النتائج ومؤشرات الأثر';
      secDTitle = 'ملاحظات وتوصيات إضافية';
      break;
  }

  // التاريخ والعام الدراسي بالهجري فقط وبأرقام عربية
  const formattedDate = formatHijriOnly(reportData.date);
  const formattedAcademicYear = formatAcademicYearOnly(academicYear);

  // تحميل شعار وزارة التعليم كـ Data URI لضمان ظهوره في PDF والمعاينة دون الاعتماد على الشبكة
  const moeLogoDataUri = getLocalImageAsDataUri(ministryLogoUrl || '/images/moe-logo.png') ||
    (baseUrl ? `${baseUrl}/images/moe-logo.png` : '/images/moe-logo.png');

  // معالجة ختم المدرسة (إذا وجد فعلياً)
  const stampDataUri = schoolStamp ? (getLocalImageAsDataUri(schoolStamp) || (baseUrl ? `${baseUrl}${schoolStamp}` : schoolStamp)) : null;

  // معالجة روابط الصور للتأكد من أنها مكتملة في PDF وتعمل دون اتصال
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const dataUri = getLocalImageAsDataUri(url);
    if (dataUri) return dataUri;
    return baseUrl ? `${baseUrl}${url}` : url;
  };

  // تقييم المحتوى النصي لتحديد نمط العرض واستغلال المساحة المتاحة في الصفحة الأولى
  const objCount = reportData.objectives?.filter(Boolean).length || 0;
  const stepsCount = reportData.steps?.filter(Boolean).length || 0;
  const outcomesCount = reportData.outcomes?.filter(Boolean).length || 0;
  const hasNotes = !!(reportData.notes && reportData.notes.trim());

  const totalItemsCount = objCount + stepsCount + outcomesCount;
  const totalTextLength =
    (reportData.objectives?.join('') || '').length +
    (reportData.steps?.join('') || '').length +
    (reportData.outcomes?.join('') || '').length +
    (reportData.notes || '').length;

  // إذا كان النص طويلاً نسبياً
  const isTextLong = objCount > 4 || stepsCount > 4 || totalTextLength > 360;
  const textGridClass = isTextLong ? 'grid-cols-1' : 'grid-cols-2';

  // هل تتسع الصفحة الأولى لعرض الصورتين كبيرتين بحجم بارز ومناسب دون ترك فراغات؟
  const canFitTwoImagesLargeOnPage1 = totalItemsCount <= 7 && totalTextLength <= 380 && objCount <= 3 && stepsCount <= 3;

  // إدارة الصفحات والشواهد:
  let isMultiPage = false;
  if (imgCount > 2) {
    isMultiPage = true;
  } else if (imgCount === 2 && !canFitTwoImagesLargeOnPage1) {
    isMultiPage = true;
  } else if (imgCount === 1 && isTextLong) {
    isMultiPage = true;
  }

  const imagesPerPage = 6;
  const galleryPages = isMultiPage ? Math.ceil(imgCount / imagesPerPage) : 0;
  const totalPages = isMultiPage ? (1 + galleryPages) : 1;

  // دالة تذييل الصفحة وتكرار التوقيعات في أسفل كل صفحة A4
  const renderFooter = (pageNumber: number, total: number) => `
    <div class="page-footer">
      <div class="signatures-row">
        <div class="signature-block">
          <div class="signature-title">${reportType === 'classroom_visit' ? 'المعلم الزائر' : (reportType === 'meeting' ? 'رئيس الاجتماع' : 'المعلم / المنفذ')}</div>
          <div class="signature-name">${(reportType === 'classroom_visit' && reportData.visitingTeacher) ? reportData.visitingTeacher : (reportData.executor || '—')}</div>
        </div>
        ${stampDataUri ? `
        <div class="signature-block" style="text-align: center; min-width: 110px;">
          <img src="${stampDataUri}" alt="ختم المدرسة" style="max-height: 70px; max-width: 110px; object-fit: contain; margin: 0 auto; display: block;" />
        </div>` : ''}
        <div class="signature-block">
          <div class="signature-title">${reportType === 'classroom_visit' && reportData.visitedTeacher ? 'المعلم المزار' : 'مدير المدرسة'}</div>
          <div class="signature-name">${reportType === 'classroom_visit' && reportData.visitedTeacher ? reportData.visitedTeacher : (schoolPrincipal || '')}</div>
        </div>
      </div>
      <div class="page-number-row">
        <span>شواهد التقويم المدرسي | ${reportData.title}</span>
        <span>صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(total)}</span>
      </div>
    </div>
  `;

  // تخطيط شبكة معرض الصور في الصفحة الثانية وما بعدها
  const getGalleryGridClass = (count: number) => {
    if (count <= 2) return 'gallery-cols-2';
    if (count <= 4) return 'gallery-cols-2';
    return 'gallery-cols-3';
  };

  const getGalleryImgHeight = (count: number) => {
    if (count <= 2) return 'gallery-h-showcase';
    if (count <= 4) return 'gallery-h-medium';
    return 'gallery-h-compact';
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=794, initial-scale=1.0" />
  <title>تقرير توثيق ${reportData.type} - ${reportData.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 210mm;
      min-width: 210mm;
      margin: 0 auto;
      padding: 0;
      box-sizing: border-box;
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
      direction: rtl;
      text-align: right;
      color: #0f172a;
      background-color: #f1f5f9;
      line-height: 1.5;
      font-size: 12px;
      -webkit-font-smoothing: antialiased;
    }
    .report-document {
      width: 210mm;
      min-width: 210mm;
      max-width: 210mm;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .report-page {
      width: 210mm;
      min-width: 210mm;
      max-width: 210mm;
      height: 297mm;
      min-height: 297mm;
      box-sizing: border-box;
      margin: 0 auto 24px auto;
      padding: 10mm 14mm 12mm 14mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      page-break-after: always;
      break-after: page;
      position: relative;
    }
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .report-document {
        width: 210mm !important;
        max-width: 210mm !important;
      }
      .report-page {
        box-shadow: none !important;
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
      }
    }
    .report-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
      margin-bottom: 0;
    }
    .page-body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
    }
    .page-footer {
      flex-shrink: 0;
      margin-top: auto;
      padding-top: 8px;
    }
    .header-border {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .table-meta {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11.5px;
    }
    .table-meta th, .table-meta td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: right;
    }
    .table-meta th {
      background-color: #f8fafc;
      color: #0f766e;
      font-weight: 700;
      width: 16%;
    }
    .table-meta td {
      background-color: #ffffff;
      color: #1e293b;
    }
    .extra-fields-table {
      margin-top: 6px;
      table-layout: fixed;
      word-break: break-word;
    }
    .two-col-grid {
      display: grid;
      gap: 10px;
      margin-bottom: 10px;
    }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .grid-cols-2 { grid-template-columns: 1fr 1fr; }
    .col-box {
      display: flex;
      flex-direction: column;
    }
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
    .list-items {
      padding-right: 16px;
      margin: 0;
    }
    .list-items li {
      margin-bottom: 3px;
    }

    /* قسم الصور المضمنة بالصفحة الأولى (كبيرة وتملأ المساحة المتاحة) */
    .inline-images-section {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-top: 6px;
    }
    .inline-images-grid {
      display: grid;
      gap: 12px;
      flex: 1 1 auto;
    }
    .inline-img-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 250px;
      flex: 1 1 auto;
    }
    .inline-img-large {
      max-width: 100%;
      width: 100%;
      height: 245px;
      object-fit: contain;
      border-radius: 4px;
      background: #f8fafc;
    }
    .image-caption {
      font-size: 10.5px;
      font-weight: 500;
      color: #334155;
      margin-top: 6px;
      text-align: center;
    }

    /* شبكة ملحق الصور في الصفحة الثانية */
    .gallery-grid {
      display: grid;
      gap: 12px;
      margin-top: 8px;
      flex: 1 1 auto;
    }
    .gallery-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .gallery-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .gallery-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .gallery-card img {
      max-width: 100%;
      width: 100%;
      object-fit: contain;
      border-radius: 4px;
      background: #f8fafc;
    }
    .gallery-h-showcase { height: 330px; }
    .gallery-h-medium { height: 215px; }
    .gallery-h-compact { height: 170px; }

    /* التوقيعات والتذييل */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      margin-bottom: 6px;
      font-size: 11.5px;
    }
    .signature-block {
      text-align: center;
      width: 30%;
    }
    .signature-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 24px;
      font-size: 11.5px;
    }
    .signature-name {
      font-weight: 600;
      color: #0f172a;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      font-size: 11.5px;
    }
    .page-number-row {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 3px;
    }
    .header-compact {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    @media screen and (max-width: 768px) {
      .report-page {
        width: 100%;
        height: auto;
        min-height: auto;
        padding: 12px;
        margin-bottom: 16px;
      }
      .grid-cols-2 { grid-template-columns: 1fr; }
      .gallery-cols-2, .gallery-cols-3 { grid-template-columns: 1fr; }
      .inline-images-grid { grid-template-columns: 1fr !important; }
      .signatures-row { flex-direction: column; gap: 14px; align-items: center; }
      .signature-block { width: 100%; }
    }
    @media print {
      body {
        background-color: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .report-document {
        max-width: none;
        width: 100%;
      }
      .report-page {
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        padding: 10mm 14mm 12mm 14mm !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-document">
    <!-- ==================== الصفحة الأولى: ملخص وبيانات التقرير ==================== -->
    <div class="report-page page-1">
      <div class="page-body">
        <!-- ترويسة التقرير الرسمية -->
        <div class="header-border">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <!-- الجانب الأيمن: بيانات وزارة التعليم والمدرسة -->
              <td style="width: 33%; text-align: right; border: none; vertical-align: middle;">
                <div style="font-weight: 700; color: #0f172a; font-size: 12px; line-height: 1.4;">المملكة العربية السعودية</div>
                <div style="font-weight: 600; color: #1e293b; font-size: 11.5px; line-height: 1.4;">وزارة التعليم</div>
                <div style="color: #475569; font-size: 11px; line-height: 1.4;">${educationDepartment}</div>
                <div style="font-weight: 700; color: #0f766e; font-size: 12px; line-height: 1.4; margin-top: 2px;">${schoolName}</div>
              </td>

              <!-- الوسط: شعار وزارة التعليم الجديد المعتمد (مكبر وبارز بصرياً) -->
              <td style="width: 34%; text-align: center; border: none; vertical-align: middle;">
                ${moeLogoDataUri ? `
                  <img
                    src="${moeLogoDataUri}"
                    alt="شعار وزارة التعليم"
                    style="height: 85px; max-width: 220px; object-fit: contain; margin: 0 auto; display: block;"
                  />
                ` : ''}
              </td>

              <!-- الجانب الأيسر: شارة التوثيق والمؤشر المرتبط -->
              <td style="width: 33%; text-align: left; border: none; vertical-align: middle;">
                <div style="display: inline-block; text-align: left;">
                  <div style="background-color: #f0fdf9; border: 1px solid #99f6e0; border-radius: 8px; padding: 5px 12px; margin-bottom: 4px; text-align: center;">
                    <div style="font-size: 9.5px; font-weight: 700; color: #0f766e;">شواهد التقويم المدرسي</div>
                    <div style="font-size: 13px; font-weight: 800; color: #042f2c;">${badgeTitle}</div>
                    <div style="font-size: 9.5px; color: #64748b;">العام: ${formattedAcademicYear}</div>
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

        <!-- جدول البيانات التعريفية حسب نوع التقرير -->
        ${(() => {
          switch (reportType) {
            case 'teaching_strategy':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>المادة</th>
                  <td style="font-weight: 600; color: #0f766e;">${reportData.subject || '—'}</td>
                </tr>
                <tr>
                  <th>الصف / المرحلة</th>
                  <td>${reportData.gradeLevel || '—'}</td>
                  <th>تاريخ التنفيذ</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                </tr>
                <tr>
                  <th>الوسائل والأدوات</th>
                  <td>${(reportData.tools && reportData.tools.length > 0) ? reportData.tools.join('، ') : 'أوراق عمل، شاشة تفاعلية'}</td>
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'school_initiative':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الفئة المستهدفة</th>
                  <td>${reportData.audience || 'المجتمع المدرسي'}</td>
                </tr>
                <tr>
                  <th>تاريخ الإطلاق / المدة</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${reportData.initiativeIdea ? `
                <tr>
                  <th>فكرة المبادرة</th>
                  <td colspan="3" style="color: #334155; font-size: 11px; line-height: 1.5;">${reportData.initiativeIdea}</td>
                </tr>` : ''}
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'training_workshop':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الفئة المستهدفة</th>
                  <td>${reportData.audience || 'المعلمون'}</td>
                </tr>
                <tr>
                  <th>تاريخ ووقت التدريب</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                  <th>عدد الحضور</th>
                  <td>${reportData.beneficiariesCount || '—'}</td>
                </tr>
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'meeting':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الحاضرون / الفئة</th>
                  <td>${reportData.audience || 'أعضاء الاجتماع'}</td>
                </tr>
                <tr>
                  <th>تاريخ ووقت الاجتماع</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                  <th>موعد الاجتماع القادم</th>
                  <td>${reportData.nextMeetingDate || 'يحدد لاحقاً'}</td>
                </tr>
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'occasion':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الفئة المشاركة</th>
                  <td>${reportData.audience || 'جميع منسوبي المدرسة'}</td>
                </tr>
                <tr>
                  <th>تاريخ المناسبة</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${reportData.occasionSignificance ? `
                <tr>
                  <th>أهمية المناسبة</th>
                  <td colspan="3" style="color: #334155; font-size: 11px; line-height: 1.5;">${reportData.occasionSignificance}</td>
                </tr>` : ''}
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'classroom_visit':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>المعلم الزائر</th>
                  <td style="font-weight: 600;">${reportData.visitingTeacher || '—'}</td>
                  <th>المعلم المزار</th>
                  <td style="font-weight: 600;">${reportData.visitedTeacher || reportData.executor || '—'}</td>
                </tr>
                <tr>
                  <th>المادة والصف</th>
                  <td>${reportData.subject || '—'} - ${reportData.gradeLevel || '—'}</td>
                  <th>تاريخ الزيارة والحصة</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate} ${reportData.visitPeriod ? `(${reportData.visitPeriod})` : ''}</td>
                </tr>
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'results_analysis':
              return `
              <table class="table-meta">
                <tr>
                  <th>${titleLabel}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الصف / الشعبة</th>
                  <td>${reportData.gradeLevel || '—'}</td>
                </tr>
                <tr>
                  <th>تاريخ التحليل / الفصل</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                  <th>عدد الطلاب المختبرين</th>
                  <td>${reportData.beneficiariesCount || '—'}</td>
                </tr>
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;

            case 'program_activity':
            default:
              return `
              <table class="table-meta">
                <tr>
                  <th>اسم ${reportData.type || 'البرنامج'}</th>
                  <td colspan="3" style="font-weight: 700; font-size: 12.5px; color: #042f2c;">${reportData.title}</td>
                </tr>
                <tr>
                  <th>نوع التنفيذ</th>
                  <td>${reportData.type || 'برنامج'}</td>
                  <th>تاريخ التنفيذ</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedDate}</td>
                </tr>
                <tr>
                  <th>${executorLabel}</th>
                  <td style="font-weight: 600;">${reportData.executor || '—'}</td>
                  <th>الفئة المستهدفة</th>
                  <td>${reportData.audience || 'جميع الطلاب'}</td>
                </tr>
                <tr>
                  <th>عدد المستفيدين</th>
                  <td>${reportData.beneficiariesCount || '—'}</td>
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>
                ${indicatorText ? `
                <tr>
                  <th>نص المؤشر</th>
                  <td colspan="3" style="color: #475569; font-size: 11px;">${indicatorText}</td>
                </tr>` : ''}
              </table>`;
          }
        })()}

        <!-- صف الأقسام النصية الأول: القسم أ + القسم ب بجانب بعض في شبكة أفقية -->
        <div class="two-col-grid ${textGridClass}">
          ${reportData.objectives && reportData.objectives.length > 0 ? `
          <div class="col-box">
            <div class="section-title">${secATitle}</div>
            <div class="content-box">
              <ul class="list-items">
                ${reportData.objectives.map(obj => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
          </div>` : ''}

          ${reportData.steps && reportData.steps.length > 0 ? `
          <div class="col-box">
            <div class="section-title">${secBTitle}</div>
            <div class="content-box">
              <ol class="list-items" style="list-style-type: decimal;">
                ${reportData.steps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
          </div>` : ''}
        </div>

        <!-- صف الأقسام النصية الثاني: القسم ج + القسم د -->
        ${(reportData.outcomes && reportData.outcomes.length > 0) || reportData.notes ? `
        <div class="two-col-grid ${(reportData.outcomes && reportData.outcomes.length > 0 && reportData.notes) ? 'grid-cols-2' : 'grid-cols-1'}">
          ${reportData.outcomes && reportData.outcomes.length > 0 ? `
          <div class="col-box">
            <div class="section-title">${secCTitle}</div>
            <div class="content-box">
              <ul class="list-items">
                ${reportData.outcomes.map(out => `<li>${out}</li>`).join('')}
              </ul>
            </div>
          </div>` : ''}

          ${reportData.notes ? `
          <div class="col-box">
            <div class="section-title">${secDTitle}</div>
            <div class="content-box">
              <p>${reportData.notes}</p>
            </div>
          </div>` : ''}
        </div>` : ''}

        <!-- جدول المعلومات الإضافية المنقولة مع القوالب الجاهزة -->
        ${(reportData.extraFields && reportData.extraFields.length > 0) ? `
        <div class="section-title">معلومات وبيانات إضافية</div>
        <table class="table-meta extra-fields-table">
          ${reportData.extraFields.map((f) => `
          <tr>
            <th style="width: 170px;">${f.label}</th>
            <td style="white-space: pre-line; line-height: 1.7;">${f.value}</td>
          </tr>`).join('')}
        </table>` : ''}

        <!-- إذا كانت الصور قليلة (1-2 صورة) وتتسع الصفحة الأولى لعرضهما كبيرتين -->
        ${!isMultiPage && imgCount > 0 ? `
        <div class="inline-images-section">
          <div class="section-title">شواهد التوثيق المصور (${toArabicDigits(imgCount)} صور)</div>
          <div class="inline-images-grid" style="grid-template-columns: repeat(${imgCount === 1 ? '1' : '2'}, 1fr);">
            ${images.map((img, idx) => `
              <div class="inline-img-card">
                <img src="${formatImageUrl(img.url)}" alt="شاهد ${toArabicDigits(idx + 1)}" class="inline-img-large" />
                ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- إشعار عند وجود ملحق صور في الصفحة التالية -->
        ${isMultiPage ? `
        <div style="margin-top: 8px; background-color: #f0fdf9; border: 1px dashed #0f766e; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 11px; font-weight: 600; color: #0f766e;">
            📷 يتضمن التقرير ملحقاً لشواهد التوثيق المصور (${toArabicDigits(imgCount)} صور) مُرفق بالصفحة التالية بحجم واضح وموسع.
          </div>
          <div style="font-size: 10.5px; color: #64748b;">
            تابع الصفحة ٢ ⬅
          </div>
        </div>` : ''}
      </div>

      <!-- تذييل الصفحة الأولى مع التوقيعات وترقيم الصفحة -->
      ${renderFooter(1, totalPages)}
    </div>

    <!-- ==================== الصفحة الثانية وما بعدها: ملحق شواهد التوثيق ==================== -->
    ${isMultiPage ? Array.from({ length: galleryPages }).map((_, pageIdx) => {
      const pageNum = 2 + pageIdx;
      const startIdx = pageIdx * imagesPerPage;
      const pageImages = images.slice(startIdx, startIdx + imagesPerPage);
      const gridCls = getGalleryGridClass(pageImages.length);
      const heightCls = getGalleryImgHeight(pageImages.length);

      return `
      <div class="report-page page-${pageNum}">
        <div class="page-body">
          <!-- ترويسة الصفحة المرافقة -->
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

          <!-- عنوان قسم الشواهد -->
          <div class="section-title" style="margin-bottom: 8px;">
            شواهد التوثيق والفعاليات المصورة (${toArabicDigits(startIdx + 1)} - ${toArabicDigits(startIdx + pageImages.length)} من إجمالي ${toArabicDigits(imgCount)} صور)
          </div>

          <!-- شبكة الصور المتوازنة والمرنة -->
          <div class="gallery-grid ${gridCls}">
            ${pageImages.map((img, idx) => `
              <div class="gallery-card">
                <img src="${formatImageUrl(img.url)}" alt="شاهد ${toArabicDigits(startIdx + idx + 1)}" class="${heightCls}" />
                ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تذييل الصفحة المرافقة مع التوقيعات وترقيم الصفحة -->
        ${renderFooter(pageNum, totalPages)}
      </div>
      `;
    }).join('') : ''}
  </div>
</body>
</html>`;
}
