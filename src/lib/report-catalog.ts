import { ReportType } from '@/types';
import catalogData from '@/data/report-catalog.json';
import { toMasculine } from '@/lib/arabic-masculine';

/**
 * كتالوج قوالب التقارير
 * -------------------------
 * الخطوة الأولى: يختار المعلم «النوع» (مبادرة، برنامج، استراتيجية ...).
 * الخطوة الثانية: تظهر له قائمة منسدلة بتقارير ذلك النوع.
 *
 * القائمة ومحتواها مبنيّان من الموقع المصدر عبر سكربتين:
 *   - scripts/scrape_report_templates.js  → src/data/report-templates-content.json
 *   - scripts/build_report_catalog.js     → src/data/report-catalog.json
 *
 * اختيار القالب يجلب محتواه الكامل من /api/report-templates?slug=... فيُعبّأ
 * النموذج (الأهداف، الخطوات، النتائج، المعلومات الإضافية) تلقائياً.
 */

export interface ReportCatalogItem {
  /** عنوان القالب كما يظهر في القائمة المنسدلة */
  title: string;
  /** مسار القالب في الموقع المصدر (مفتاح المحتوى) */
  slug: string;
  /** هل يوجد محتوى جاهز منقول لهذا القالب؟ */
  hasContent: boolean;
}

export interface ReportCatalogCategory {
  id: string;
  /** اسم النوع الظاهر في الأزرار */
  label: string;
  /** يربط النوع بنظام أنواع التقارير الحالي */
  reportType: ReportType;
  items: ReportCatalogItem[];
}

export const REPORT_CATALOG: ReportCatalogCategory[] = catalogData.categories.map((category) => ({
  id: category.id,
  label: category.label,
  reportType: category.reportType as ReportType,
  // العناوين تُعرض بصيغة الطلاب حتى لو كان القالب في المصدر لمدارس البنات.
  items: category.items.map((item) => ({ ...item, title: toMasculine(item.title) })),
}));

/** أول تصنيف مطابق لنوع تقرير معيّن (يُستخدم عند التحميل أو استعادة مسودة) */
export function getCategoryIdForReportType(reportType: ReportType): string {
  return (
    REPORT_CATALOG.find((c) => c.reportType === reportType)?.id || REPORT_CATALOG[0].id
  );
}

/** إيجاد القالب المختار داخل الكتالوج من مساره. */
export function findCatalogItem(
  slug: string
): { category: ReportCatalogCategory; item: ReportCatalogItem } | null {
  for (const category of REPORT_CATALOG) {
    const item = category.items.find((i) => i.slug === slug);
    if (item) return { category, item };
  }
  return null;
}
