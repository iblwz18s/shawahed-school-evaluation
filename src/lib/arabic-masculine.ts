import mapData from '@/data/arabic-feminine-map.json';

/**
 * تحويل النصّ من صيغة الطالبات/المعلمات إلى صيغة الطلاب/المعلمين.
 *
 * القوالب المنقولة من الموقع المصدر مكتوبة لمدارس البنات، فتُمرَّر كل النصوص
 * على هذا المحوّل قبل تعبئة النموذج. الكلمات المخصّصة في
 * src/data/arabic-feminine-map.json، والباقي يُترك كما هو حتى لا يتلف النصّ
 * (فمثل «المهارات» و«الأنشطة المنفذة» ليست مؤنثاً بشرياً).
 */

const WORDS: Record<string, string> = mapData.words as Record<string, string>;
const PREFIXES: string[] = mapData.prefixes;
const SUFFIX_RULES: Array<{ from: string; to: string }> = mapData.suffixRules;
const SUFFIX_EXCEPTIONS: string[] = mapData.suffixExceptions;
const STANDALONE: Record<string, string> = mapData.standalone as Record<string, string>;
const PHRASES: Record<string, string> = (mapData.phrases || {}) as Record<string, string>;

const ARABIC_LETTER = /[\u0621-\u064A\u064B-\u0652\u0670\u0640]/;

function convertToken(token: string): string {
  if (!token || !ARABIC_LETTER.test(token)) return token;

  const bare = token.replace(/[\u064B-\u0652\u0670]/g, '');

  if (STANDALONE[bare]) return STANDALONE[bare];

  if (WORDS[bare]) return WORDS[bare];

  // كلمات مسبوقة بحرف أو أكثر (والطالبات، للطالبات، بمعلمتها ...)
  for (const prefix of PREFIXES) {
    if (bare.startsWith(prefix) && bare.length > prefix.length) {
      const rest = bare.slice(prefix.length);
      if (WORDS[rest]) return prefix + WORDS[rest];
    }
  }

  // ضمائر الملكية للمؤنث: مهاراتهنّ ← مهاراتهم
  if (!SUFFIX_EXCEPTIONS.includes(bare) && bare.length > 3) {
    const suffix = SUFFIX_RULES.find((rule) => bare.endsWith(rule.from));
    if (suffix) {
      const rest = bare.slice(0, -suffix.from.length);
      if (rest.length >= 2 && !SUFFIX_EXCEPTIONS.includes(rest)) {
        return rest + suffix.to;
      }
    }
  }

  return token;
}

/** يحوّل كل كلمات النصّ المؤنثة إلى المذكّرة مع الحفاظ على الترقيم والفقرات. */
export function toMasculine(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [from, to] of Object.entries(PHRASES)) {
    if (result.includes(from)) result = result.split(from).join(to);
  }
  return result.replace(/[\u0621-\u064A\u064B-\u0652\u0670\u0640]+/g, (token) => convertToken(token));
}

/** نسخة تعمل على القوائم. */
export function toMasculineLines(lines: string[]): string[] {
  return lines.map((line) => toMasculine(line));
}
