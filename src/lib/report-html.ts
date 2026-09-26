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

  // تقييم المحتوى النصي والبيانات الإضافية لتحديد نمط العرض واستغلال المساحة المتاحة في صفحة A4 بدقة
  const objCount = reportData.objectives?.filter(Boolean).length || 0;
  const stepsCount = reportData.steps?.filter(Boolean).length || 0;
  const outcomesCount = reportData.outcomes?.filter(Boolean).length || 0;
  const hasNotes = !!(reportData.notes && reportData.notes.trim());
  const extraFieldsList = (reportData.extraFields || []).filter(f => f.label && f.value);
  const extraFieldsCount = extraFieldsList.length;

  const totalItemsCount = objCount + stepsCount + outcomesCount + (hasNotes ? 1 : 0);
  const totalTextLength =
    (reportData.objectives?.join('') || '').length +
    (reportData.steps?.join('') || '').length +
    (reportData.outcomes?.join('') || '').length +
    (reportData.notes || '').length +
    extraFieldsList.reduce((acc, f) => acc + (f.label?.length || 0) + (f.value?.length || 0), 0);

  // حساب عدد صفوف البيانات الإضافية المزدوجة (كل حقلين يشغلان صفاً واحداً متناسقاً جنباً إلى جنب)
  const extraRowsCount = Math.ceil(extraFieldsCount / 2);
  const totalContentRows = totalItemsCount + extraRowsCount * 2;

  // هل تتسع الصفحة الأولى لعرض صورتين دون أي ضغط أو تداخل في المعاينة أو الطباعة؟
  const canFitTwoImagesOnPage1 = totalContentRows <= 7 && totalTextLength <= 440 && objCount <= 3 && stepsCount <= 3 && extraRowsCount <= 2;
  const canFitOneImageOnPage1 = totalContentRows <= 10 && totalTextLength <= 700 && extraRowsCount <= 3;

  // إدارة الصفحات والشواهد:
  let isMultiPage = false;
  if (imgCount > 2) {
    isMultiPage = true;
  } else if (imgCount === 2) {
    isMultiPage = !canFitTwoImagesOnPage1;
  } else if (imgCount === 1) {
    isMultiPage = !canFitOneImageOnPage1;
  }

  // ارتفاع الصور المضمنة في الصفحة الأولى لمنع أي تداخل مع الفوتر أو الجداول
  let inlineImgHeight = 220;
  if (totalContentRows > 6 || totalTextLength > 360) {
    inlineImgHeight = 150;
  } else if (totalContentRows > 4) {
    inlineImgHeight = 180;
  }

  // دالة لتوليد صفوف البيانات الإضافية مرتبة جنباً إلى جنب في 4 أعمدة متناسقة بنسبة 16% / 34% / 16% / 34%
  const renderExtraFieldsRows = (fields: Array<{ label: string; value: string }>) => {
    if (!fields || fields.length === 0) return '';
    const rows: string[] = [];
    let i = 0;
    while (i < fields.length) {
      const cur = fields[i];
      const isCurLong = (cur.value || '').length > 40 || (cur.value || '').includes('\n');
      if (isCurLong) {
        rows.push(`
          <tr>
            <th style="width: 16%;">${cur.label}</th>
            <td colspan="3" style="width: 84%; white-space: pre-line; line-height: 1.6;">${cur.value}</td>
          </tr>
        `);
        i++;
      } else {
        const next = i + 1 < fields.length ? fields[i + 1] : null;
        const isNextLong = next ? ((next.value || '').length > 40 || (next.value || '').includes('\n')) : false;
        if (next && !isNextLong) {
          rows.push(`
            <tr>
              <th style="width: 16%;">${cur.label}</th>
              <td style="width: 34%; font-weight: 500;">${cur.value}</td>
              <th style="width: 16%;">${next.label}</th>
              <td style="width: 34%; font-weight: 500;">${next.value}</td>
            </tr>
          `);
          i += 2;
        } else {
          rows.push(`
            <tr>
              <th style="width: 16%;">${cur.label}</th>
              <td colspan="3" style="width: 84%; font-weight: 500;">${cur.value}</td>
            </tr>
          `);
          i++;
        }
      }
    }
    return rows.join('');
  };

  // تجميع الأقسام النصية النشطة وتوزيعها جنباً إلى جنب بسلاسة في شبكة ثنائية
  interface ActiveSection {
    title: string;
    type: 'ul' | 'ol' | 'p';
    items?: string[];
    text?: string;
  }
  const activeSections: ActiveSection[] = [];
  if (reportData.objectives && reportData.objectives.length > 0) {
    activeSections.push({ title: secATitle, type: 'ul', items: reportData.objectives });
  }
  if (reportData.steps && reportData.steps.length > 0) {
    activeSections.push({ title: secBTitle, type: 'ol', items: reportData.steps });
  }
  if (reportData.outcomes && reportData.outcomes.length > 0) {
    activeSections.push({ title: secCTitle, type: 'ul', items: reportData.outcomes });
  }
  if (reportData.notes && reportData.notes.trim()) {
    activeSections.push({ title: secDTitle, type: 'p', text: reportData.notes.trim() });
  }

  const renderSectionBox = (sec: ActiveSection) => `
    <div class="col-box">
      <div class="section-title">${sec.title}</div>
      <div class="content-box">
        ${sec.type === 'ul' ? `
          <ul class="list-items">
            ${(sec.items || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : sec.type === 'ol' ? `
          <ol class="list-items" style="list-style-type: decimal;">
            ${(sec.items || []).map(item => `<li>${item}</li>`).join('')}
          </ol>
        ` : `
          <p style="white-space: pre-line;">${sec.text || ''}</p>
        `}
      </div>
    </div>
  `;

  const renderSectionsGrid = () => {
    if (activeSections.length === 0) return '';
    const grids: string[] = [];
    let i = 0;
    while (i < activeSections.length) {
      if (i + 1 < activeSections.length) {
        grids.push(`
          <div class="two-col-grid grid-cols-2">
            ${renderSectionBox(activeSections[i])}
            ${renderSectionBox(activeSections[i + 1])}
          </div>
        `);
        i += 2;
      } else {
        grids.push(`
          <div class="two-col-grid grid-cols-1">
            ${renderSectionBox(activeSections[i])}
          </div>
        `);
        i++;
      }
    }
    return grids.join('');
  };

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
      font-size: 11.5px;
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
      max-height: 297mm;
      box-sizing: border-box;
      margin: 0 auto 20px auto;
      padding: 8mm 12mm 10mm 12mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
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
        padding: 8mm 12mm 10mm 12mm !important;
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .report-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
        margin-bottom: 0 !important;
      }
      .table-meta, .extra-fields-table, .two-col-grid, .content-box, .signatures-row, .page-footer, tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
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
      min-height: 0;
    }
    .page-footer {
      flex-shrink: 0;
      margin-top: auto;
      padding-top: 6px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header-border {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 6px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .table-meta {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 11px;
      table-layout: fixed;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .table-meta th, .table-meta td {
      border: 1px solid #cbd5e1;
      padding: 4px 7px;
      text-align: right;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
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
      width: 34%;
    }
    .extra-fields-table {
      margin-top: 0;
      margin-bottom: 8px;
      table-layout: fixed;
    }
    .two-col-grid {
      display: grid;
      gap: 8px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .grid-cols-2 { grid-template-columns: 1fr 1fr; }
    .col-box {
      display: flex;
      flex-direction: column;
      min-height: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f766e;
      background-color: #f0fdf9;
      border-right: 3px solid #0f766e;
      padding: 3px 8px;
      margin-bottom: 4px;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .content-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 9px;
      font-size: 11px;
      line-height: 1.5;
      flex: 1 1 auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .list-items {
      padding-right: 14px;
      margin: 0;
    }
    .list-items li {
      margin-bottom: 2px;
    }

    /* قسم الصور المضمنة بالصفحة الأولى */
    .inline-images-section {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-top: 4px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .inline-images-grid {
      display: grid;
      gap: 8px;
      flex: 1 1 auto;
    }
    .inline-img-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex: 1 1 auto;
    }
    .inline-img-large {
      max-width: 100%;
      width: 100%;
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
        max-width: 210mm !important;
        width: 210mm !important;
      }
      .report-page {
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        padding: 8mm 12mm 10mm 12mm !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .report-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
        margin-bottom: 0 !important;
      }
      .table-meta, .extra-fields-table, .two-col-grid, .content-box, .signatures-row, .page-footer, tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
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
                  ${reportData.beneficiariesCount ? `
                  <th>عدد المستفيدين</th>
                  <td>${reportData.beneficiariesCount}</td>
                  ` : `
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                  `}
                </tr>
                ${reportData.beneficiariesCount ? `
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>` : ''}
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
                  ${reportData.beneficiariesCount ? `
                  <th>عدد المشاركين</th>
                  <td>${reportData.beneficiariesCount}</td>
                  ` : `
                  <th>العام الدراسي</th>
                  <td style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                  `}
                </tr>
                ${reportData.beneficiariesCount ? `
                <tr>
                  <th>العام الدراسي</th>
                  <td colspan="3" style="font-weight: 600; color: #0f766e;">${formattedAcademicYear}</td>
                </tr>` : ''}
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

        <!-- جدول البيانات والمعلومات الإضافية (المكان، الشراكات، الأعداد...) مرتبة جنباً إلى جنب بسلاسة -->
        ${(extraFieldsList.length > 0) ? `
        <table class="table-meta extra-fields-table">
          <tr>
            <th colspan="4" style="background-color: #f0fdf9; color: #0f766e; text-align: right; font-size: 11px; padding: 3px 8px; border-bottom: 2px solid #0f766e;">
              بيانات إضافية وشراكات التنفيذ
            </th>
          </tr>
          ${renderExtraFieldsRows(extraFieldsList)}
        </table>` : ''}

        <!-- شبكة الأقسام النصية المتناسقة جنباً إلى جنب بسلاسة -->
        ${renderSectionsGrid()}

        <!-- إذا كانت الصور قليلة (1-2 صورة) وتتسع الصفحة الأولى لعرضهما -->
        ${!isMultiPage && imgCount > 0 ? `
        <div class="inline-images-section">
          <div class="section-title">شواهد التوثيق المصور (${toArabicDigits(imgCount)} صور)</div>
          <div class="inline-images-grid" style="grid-template-columns: repeat(${imgCount === 1 ? '1' : '2'}, 1fr);">
            ${images.map((img, idx) => `
              <div class="inline-img-card">
                <img src="${formatImageUrl(img.url)}" alt="شاهد ${toArabicDigits(idx + 1)}" class="inline-img-large" style="height: ${inlineImgHeight}px; max-height: ${inlineImgHeight}px;" />
                ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- إشعار عند وجود ملحق صور في الصفحة التالية -->
        ${isMultiPage ? `
        <div style="margin-top: auto; margin-bottom: 4px; background-color: #f0fdf9; border: 1px dashed #0f766e; border-radius: 6px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; page-break-inside: avoid; break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 600; color: #0f766e;">
            📷 يتضمن التقرير ملحقاً لشواهد التوثيق المصور (${toArabicDigits(imgCount)} صور) مُرفق بالصفحة التالية بحجم واضح وموسع.
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #042f2c; background: #ccfbf1; padding: 2px 8px; border-radius: 4px;">
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
