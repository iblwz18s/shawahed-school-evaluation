import { NextRequest, NextResponse } from 'next/server';
import contentData from '@/data/report-templates-content.json';
import catalogData from '@/data/report-catalog.json';
import { buildTemplatePrefill } from '@/lib/report-template-fields';
import { ReportType } from '@/types';

export const dynamic = 'force-dynamic';

interface SourceTemplate {
  title?: string;
  fields?: Record<string, string>;
}

const SOURCE_TEMPLATES = (contentData as { templates: Record<string, SourceTemplate> }).templates;

/**
 * GET /api/report-templates?slug=/shawahed/events/saudi-founding-day-report
 * يعيد محتوى القالب جاهزاً لتعبئة نموذج التقرير كاملاً.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'المعامل slug مطلوب.' }, { status: 400 });
  }

  const category = (catalogData.categories as Array<{ id: string; label: string; reportType: string; items: Array<{ title: string; slug: string; hasContent: boolean }> }>).find(
    (c) => c.items.some((i) => i.slug === slug)
  );
  const item = category?.items.find((i) => i.slug === slug);

  if (!category || !item) {
    return NextResponse.json({ error: 'القالب غير موجود في الكتالوج.' }, { status: 404 });
  }

  const template = SOURCE_TEMPLATES[slug];
  if (!template || !template.fields) {
    // قوالب الأغلفة/الفهارس في المصدر لا تحتوي حقولاً جاهزة، فنعبّئ العنوان فقط.
    return NextResponse.json({
      slug,
      title: item.title,
      hasContent: false,
      prefill: {
        title: item.title,
        date: '',
        audience: 'جميع طلاب المدرسة',
        beneficiariesCount: '',
        subject: '',
        gradeLevel: '',
        initiativeIdea: '',
        occasionSignificance: '',
        objectives: [],
        steps: [],
        outcomes: [],
        notes: '',
        extraFields: [],
      },
    });
  }

  const prefill = buildTemplatePrefill(template.fields, category.reportType as ReportType);

  return NextResponse.json({
    slug,
    title: prefill.title || item.title,
    hasContent: true,
    prefill,
  });
}
