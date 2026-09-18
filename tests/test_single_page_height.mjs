import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { generateReportHtml } from '../src/lib/report-html.ts';
import { generatePdfFromHtml } from '../src/lib/pdf-generator.ts';

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

async function check() {
  const img1 = await makeImage('شاهد 1: انطلاق الفعالية', 'حضور الطلاب والترحيب', '#0f766e');
  const img2 = await makeImage('شاهد 2: المعرض التفاعلي', 'أعمال الطلاب ومشاريعهم', '#1e40af');

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

  const html = generateReportHtml({ reportData: report1 });
  console.log('Includes inline-images-section?', html.includes('inline-images-section'));
  console.log('Includes page-2?', html.includes('page-2'));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });

  // Check scrollHeight vs clientHeight
  const dimensions = await page.evaluate(() => {
    const el = document.querySelector('.report-page.page-1');
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      offsetHeight: el.offsetHeight,
      bodyScrollHeight: document.body.scrollHeight,
    };
  });
  console.log('Dimensions of page-1:', dimensions);

  const pdfBuf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const str = pdfBuf.toString('latin1');
  const matches = str.match(/\/Type\s*\/Page\b/g);
  console.log('PDF Page count:', matches ? matches.length : 0);

  await browser.close();
}

check().catch(console.error);
