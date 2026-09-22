/**
 * حذف الملفات التجريبية والتقارير القديمة نهائياً:
 *  1) من المستودع (git rm) ومن القرص — كل ما تحت public/uploads عدا .gitkeep
 *     (هذه مخرجات مولّدة من اختبارات وتجارب سابقة، ليست أصولاً مصدرية،
 *      والمجلد نفسه مستثنى في .gitignore)
 *  2) من Supabase Storage — تفريغ دلوّي report-pdfs و report-images فقط،
 *     مع الإبقاء التام على دلوّ الشعارات school-assets.
 *
 * آمن لإعادة التشغيل.
 * التشغيل:  node scripts/purge_demo_files.js [--skip-supabase]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const uploadsDir = path.join(ROOT, 'public', 'uploads');
const skipSupabase = process.argv.includes('--skip-supabase');

/* ---------- 1) الملفات المحلية والمتعقّبة ---------- */

let removedTracked = 0;
try {
  const tracked = execSync('git ls-files public/uploads', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (tracked.length > 0) {
    // git rm يحذف من الفهرس ومن القرص معاً
    for (let i = 0; i < tracked.length; i += 50) {
      const batch = tracked.slice(i, i + 50);
      execSync(`git rm -q -- ${batch.map((f) => `"${f}"`).join(' ')}`, { cwd: ROOT });
    }
    removedTracked = tracked.length;
  }
} catch (err) {
  console.warn('تحذير: git rm فشل (قد لسنا داخل مستودع؟):', err.message);
}

// ما بقي على القرص غير المتعقّب — يُحذف يدوياً عدا .gitkeep
let removedUntracked = 0;
if (fs.existsSync(uploadsDir)) {
  const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(uploadsDir, entry.name);
    if (entry.name === '.gitkeep') continue;
    fs.rmSync(full, { recursive: true, force: true });
    removedUntracked++;
  }
  // ضمان وجود .gitkeep والمجلدات التي يكتب إليها الكود وقت التشغيل
  fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
  for (const sub of ['reports/images', 'reports/pdf']) {
    fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, sub, '.gitkeep'), '');
  }
}

console.log(`حُذف من المستودع/القرص: ${removedTracked} ملفاً متعقّباً، ${removedUntracked} عنصراً متبقياً.`);

/* ---------- 2) دلاء Supabase (التقارير فقط) ---------- */

async function purgeSupabase() {
  // قراءة المفاتيح من .env يدوياً (المشروع لا يستخدم dotenv في السكربتات)
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('تخطي Supabase: لا توجد مفاتيح في .env');
    return;
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const bucket of ['report-pdfs', 'report-images']) {
    const { data: files, error } = await supabase.storage.from(bucket).list('', {
      limit: 1000,
      offset: 0,
    });
    if (error) {
      console.warn(`تعذّر عرض ${bucket}:`, error.message);
      continue;
    }
    if (!files || files.length === 0) {
      console.log(`${bucket}: فارغ أصلاً.`);
      continue;
    }
    const toDelete = files.map((f) => f.name);
    const { error: delErr } = await supabase.storage.from(bucket).remove(toDelete);
    console.log(
      delErr ? `فشل حذف ${bucket}: ${delErr.message}` : `حُذف من ${bucket}: ${toDelete.length} ملفاً`
    );
  }
  // دلوّ school-assets (الشعارات) لا يُمسّ إطلاقاً.
}

if (skipSupabase) {
  console.log('تم تجاوز حذف Supabase (--skip-supabase).');
} else {
  purgeSupabase()
    .catch((err) => {
      console.warn('تعذّر تنظيف Supabase:', err.message);
    })
    .finally(() => {
      console.log('تم التنظيف.');
    });
}

if (skipSupabase) console.log('تم التنظيف.');
