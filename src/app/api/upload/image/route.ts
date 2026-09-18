import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { processAndSaveImage } from '@/lib/image-processor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لرفع الصور' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف صورة' }, { status: 400 });
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'الملف المرفوع يجب أن يكون صورة (JPG, PNG, WEBP)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // معالجة الصورة في الخادم: ضبط الأبعاد لـ 1600px كحد أقصى، تصحيح الاتجاه، ضغط WebP
    const result = await processAndSaveImage(buffer, file.name, {
      maxDimension: 1600,
      quality: 82,
    });

    return NextResponse.json({
      success: true,
      url: result.relativeUrl,
      width: result.width,
      height: result.height,
      size: result.size,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: 'فشل في معالجة وحفظ الصورة' }, { status: 500 });
  }
}
