import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { ReportType } from '@/types';
import {
  generateTailoredReportData,
  callGeminiIfConfigured,
  AiRequestParams,
} from '@/lib/ai-educational-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const body = await req.json();
    const {
      reportType = 'program_activity',
      title = '',
      type = 'برنامج',
      subject = '',
      gradeLevel = '',
      audience = '',
      objectives = [],
      steps = [],
      outcomes = [],
      weaknesses = [],
      tools = [],
      notes = '',
      requestedCounts = {},
    } = body;

    const params: AiRequestParams = {
      reportType: reportType as ReportType,
      title: String(title || '').trim(),
      type: String(type || 'برنامج').trim(),
      subject: String(subject || '').trim(),
      gradeLevel: String(gradeLevel || '').trim(),
      audience: String(audience || '').trim(),
      objectives: Array.isArray(objectives) ? objectives : [],
      steps: Array.isArray(steps) ? steps : [],
      outcomes: Array.isArray(outcomes) ? outcomes : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      tools: Array.isArray(tools) ? tools : [],
      notes: String(notes || '').trim(),
      requestedCounts: {
        objectives: Number(requestedCounts?.objectives) || Math.max(Array.isArray(objectives) ? objectives.length : 3, 3),
        steps: Number(requestedCounts?.steps) || Math.max(Array.isArray(steps) ? steps.length : 4, 4),
        outcomes: Number(requestedCounts?.outcomes) || Math.max(Array.isArray(outcomes) ? outcomes.length : 3, 3),
        weaknesses: Number(requestedCounts?.weaknesses) || Math.max(Array.isArray(weaknesses) ? weaknesses.length : 3, 3),
        tools: Number(requestedCounts?.tools) || Math.max(Array.isArray(tools) ? tools.length : 3, 3),
      },
    };

    // 1. محاولة استخدام Gemini إذا توفر مفتاح البيئة
    let enhanced = null;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      enhanced = await callGeminiIfConfigured(geminiKey, params);
    }

    // 2. إذا لم يتوفر مفتاح أو تعذر الاتصال، نستخدم المحرك الدلالي التربوي المتطور فائق الدقة
    if (!enhanced) {
      enhanced = generateTailoredReportData(params);
    }

    return NextResponse.json({
      success: true,
      reportType,
      enhanced,
    });
  } catch (error) {
    console.error('AI enhance error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعداد التقرير بالذكاء الاصطناعي' },
      { status: 500 }
    );
  }
}
