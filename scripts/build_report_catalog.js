/**
 * يبني ملف الكتالوج src/data/report-catalog.json من محتوى القوالب المنقول.
 *
 * الترتيب يؤخذ من صفحات الأقسام في الموقع المصدر كما هي، ويُربط كل عنوان
 * بـ slug القالب حتى يجلب النموذج محتواه كاملاً عند الاختيار.
 *
 * التشغيل:  node scripts/build_report_catalog.js
 */
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://edu-forms.com';
const CONTENT_FILE = path.join('src', 'data', 'report-templates-content.json');
const OUT_FILE = path.join('src', 'data', 'report-catalog.json');

/** كل قسم في المصدر يقابل تصنيفاً في الكتالوج مع نوع التقرير الخاص به. */
const CATEGORIES = [
  { id: 'initiatives', label: 'مبادرة مدرسية', reportType: 'school_initiative', section: 'initiatives', path: '/shawahed/initiatives' },
  { id: 'documentation', label: 'برنامج / نشاط', reportType: 'program_activity', section: 'forms_and_reports', path: '/forms-and-reports' },
  { id: 'teaching-strategies', label: 'استراتيجية تدريس', reportType: 'teaching_strategy', section: 'strategies', path: '/shawahed/strategies' },
  { id: 'events', label: 'يوم عالمي / مناسبة', reportType: 'occasion', section: 'events', path: '/shawahed/events' },
  { id: 'tech-programs', label: 'برنامج / أداة تقنية', reportType: 'program_activity', section: 'technical', path: '/shawahed/technical' },
  { id: 'classroom-management', label: 'إدارة صفية', reportType: 'teaching_strategy', section: 'classroom_management', path: '/shawahed/classroom-management-strategies' },
  { id: 'teaching-aids', label: 'وسيلة تعليمية', reportType: 'program_activity', section: 'aids', path: '/shawahed/aids' },
  { id: 'teacher-eval', label: 'شاهد تقييم أداء', reportType: 'program_activity', section: 'teacher_evaluation', path: '/teacher-evaluation' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; catalog-builder/1.0)' } });
      if (res.status === 429) {
        if (i === tries) throw new Error('HTTP 429');
        await sleep(4000 * i);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === tries) throw e;
      await sleep(1500 * i);
    }
  }
  return '';
}

function orderedLinks(html, prefix) {
  const anchors = html.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi) || [];
  const seen = new Set();
  const out = [];
  for (const a of anchors) {
    const href = (a.match(/href="([^"]+)"/) || [])[1];
    if (!href || !href.startsWith(prefix + '/')) continue;
    if (href.length <= prefix.length + 1) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    const text = a
      .replace(/<[^>]+>/g, ' ')
      .replace(/إبدأ التصميم|ابدأ التصميم/g, '')
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    out.push({ href, text });
  }
  return out;
}

async function main() {
  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const templates = content.templates || {};

  const categories = [];
  const missing = [];

  for (const cat of CATEGORIES) {
    let links = [];
    try {
      links = orderedLinks(await get(ORIGIN + cat.path), cat.path);
    } catch (e) {
      console.error(`تعذّر جلب ${cat.path}: ${e.message}`);
    }

    const items = [];
    for (const { href, text } of links) {
      const t = templates[href];
      if (!t) {
        missing.push(href);
        items.push({ title: (text || href.split('/').pop()).trim(), slug: href, hasContent: false });
        continue;
      }
      const title = (t.fields.ReportTitle || t.title || text || href.split('/').pop()).trim();
      items.push({ title, slug: href, hasContent: true });
    }

    const withContent = items.filter((i) => i.hasContent).length;
    categories.push({ id: cat.id, label: cat.label, reportType: cat.reportType, section: cat.section, items });
    console.log(`${cat.label}: ${items.length} قالباً (بمحتوى منقول: ${withContent})`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    totalItems: categories.reduce((n, c) => n + c.items.length, 0),
    categories,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf-8');

  const totalWithContent = categories.reduce((n, c) => n + c.items.filter((i) => i.hasContent).length, 0);
  console.log(`\nالإجمالي: ${out.totalItems} قالباً في ${categories.length} تصنيفات (منها ${totalWithContent} بمحتوى منقول).`);
  if (missing.length) {
    console.log(`صفحات ناقصة (${missing.length}):`);
    missing.forEach((m) => console.log('  ' + m));
  }
  console.log(`كُتب في: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error('خطأ عام:', e);
  process.exit(1);
});
