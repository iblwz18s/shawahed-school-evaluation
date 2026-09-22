/**
 * زاحف محتوى القوالب من الموقع المصدر (edu-forms.com).
 *
 * يمرّ على صفحات الأقسام، يجمع روابط صفحات القوالب، ثم يستخرج من كل صفحة:
 *   - عنوان التقرير
 *   - كل حقول النموذج الجاهزة (Fields[...]) بنصّها الكامل
 *   - عناوين الأقسام الداخلية (h2)
 * ويكتب الناتج في src/data/report-templates-content.json
 *
 * التشغيل:  node scripts/scrape_report_templates.js
 */
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://edu-forms.com';
const SECTIONS = [
  { id: 'initiatives', path: '/shawahed/initiatives' },
  { id: 'events', path: '/shawahed/events' },
  { id: 'strategies', path: '/shawahed/strategies' },
  { id: 'technical', path: '/shawahed/technical' },
  { id: 'classroom_management', path: '/shawahed/classroom-management-strategies' },
  { id: 'aids', path: '/shawahed/aids' },
  { id: 'forms_and_reports', path: '/forms-and-reports' },
  { id: 'teacher_evaluation', path: '/teacher-evaluation' },
];
const OUT_FILE = path.join('src', 'data', 'report-templates-content.json');
const DELAY_MS = 500;
const CONCURRENCY = 2;
const FORCE = process.argv.includes('--force');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'",
};

function decode(text) {
  if (!text) return '';
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z#0-9]+);/gi, (m, e) => ENTITIES[e.toLowerCase()] ?? m);
}

function clean(text) {
  return decode(text).replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return m ? decode(m[1]) : '';
}

/** يستخرج حقول النموذج الجاهزة من HTML الصفحة. */
function extractFields(html) {
  const fields = {};

  for (const tag of html.match(/<input\b[^>]*>/gi) || []) {
    const name = attr(tag, 'name');
    if (!name || !name.startsWith('Fields[')) continue;
    const key = name.slice('Fields['.length, -1);
    const type = (attr(tag, 'type') || 'text').toLowerCase();
    if (type === 'file' || type === 'hidden' || type === 'checkbox' || type === 'radio') continue;
    const value = attr(tag, 'value');
    if (value) fields[key] = clean(value);
  }

  const textareaRe = /<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/gi;
  let m;
  while ((m = textareaRe.exec(html))) {
    const name = attr(m[1], 'name');
    if (!name || !name.startsWith('Fields[')) continue;
    const key = name.slice('Fields['.length, -1);
    const value = clean(m[2]);
    if (value) fields[key] = value;
  }

  return fields;
}

/** عناوين الأقسام داخل الصفحة + عنوان الصفحة الرئيسي. */
function extractHeadings(html) {
  const headings = (html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi) || [])
    .map((h) => clean(h.replace(/<[^>]+>/g, ' ')))
    .filter((t) => t && t.length < 80);
  return headings;
}

/** نص إرشادات توثيق القالب إن وُجد. */
function extractGuidance(html) {
  const m = html.match(/إرشادات[^<]{0,80}[\s\S]{0,4000}?<\/section>/);
  if (!m) return '';
  return clean(m[0].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '\n'))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, 3000);
}

async function get(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; content-migration/1.0)' },
      });
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || 0;
        const wait = Math.max(retryAfter * 1000, 4000 * i);
        if (i === tries) throw new Error('HTTP 429 (تجاوز حد المحاولات)');
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === tries || /429/.test(e.message)) throw e;
      await sleep(1500 * i);
    }
  }
  return '';
}

function collectDetailLinks(html, prefix) {
  const links = (html.match(/href="([^"]+)"/gi) || []).map((h) => attr(h, 'href'));
  return [...new Set(links.filter((h) => h.startsWith(prefix + '/') && h.length > prefix.length + 1))];
}

function loadCache() {
  if (FORCE || !fs.existsSync(OUT_FILE)) return {};
  try {
    const prev = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
    console.log(`استُخدم التخزين المؤقت: ${Object.keys(prev.templates || {}).length} قالباً منقولة سابقاً.`);
    return prev.templates || {};
  } catch {
    return {};
  }
}

async function main() {
  const templates = loadCache();
  const sectionStats = [];

  for (const section of SECTIONS) {
    const listUrl = ORIGIN + section.path;
    let links = [];
    try {
      const html = await get(listUrl);
      links = collectDetailLinks(html, section.path);
    } catch (e) {
      console.error(`تعذّر جلب القسم ${section.path}: ${e.message}`);
      continue;
    }
    sectionStats.push({ id: section.id, path: section.path, pages: links.length });

    const queue = links.filter((rel) => !templates[rel]);
    console.log(`${section.id}: ${links.length} قالباً (متبقٍ ${queue.length})`);

    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const rel = queue.shift();
        const url = ORIGIN + rel;
        try {
          const html = await get(url);
          const fields = extractFields(html);
          if (!Object.keys(fields).length) {
            console.warn(`لا حقول في ${rel}`);
            continue;
          }
          const docTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
          templates[rel] = {
            section: section.id,
            slug: rel.split('/').pop(),
            title: fields.ReportTitle || clean(docTitle).split('|')[0].trim().replace(/^تقرير تنفيذ\s*/, ''),
            fields,
            headings: extractHeadings(html),
            guidance: extractGuidance(html),
          };
        } catch (e) {
          console.error(`فشل ${rel}: ${e.message}`);
        }
        await sleep(DELAY_MS);
      }
    });
    await Promise.all(workers);
  }

  const fieldFrequency = {};
  for (const t of Object.values(templates)) {
    for (const k of Object.keys(t.fields)) fieldFrequency[k] = (fieldFrequency[k] || 0) + 1;
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    sections: sectionStats,
    count: Object.keys(templates).length,
    fieldFrequency,
    templates,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf-8');

  console.log(`\nإجمالي القوالب المنقولة: ${out.count}`);
  console.log('أكثر الحقول شيوعاً:');
  Object.entries(fieldFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`\nكُتب في: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error('خطأ عام:', e);
  process.exit(1);
});
