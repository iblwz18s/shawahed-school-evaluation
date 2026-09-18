import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { supabaseAdmin } from './supabase';

export interface ProcessImageOptions {
  maxDimension?: number;
  quality?: number;
}

export async function processAndSaveImage(
  buffer: Buffer,
  originalFilename: string,
  options: ProcessImageOptions = {}
): Promise<{ relativeUrl: string; width: number; height: number; size: number }> {
  const { maxDimension = 1600, quality = 80 } = options;

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `img_${uniqueSuffix}.webp`;

  // معالجة الصورة باستخدام Sharp:
  // 1. تصحيح الاتجاه التلقائي بناءً على EXIF
  // 2. تصغير الأبعاد بحيث لا تتجاوز 1600px مع الحفاظ على التناسب
  // 3. ضغط وتحويل إلى WebP
  // 4. إزالة الميتا داتا غير الضرورية لتوفير المساحة
  const processed = sharp(buffer)
    .rotate() // auto-orient based on EXIF
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality });

  const outputBuffer = await processed.toBuffer();
  const metadata = await sharp(outputBuffer).metadata();

  // محاولة الرفع إلى Supabase Storage أولاً
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('report-images')
      .upload(filename, outputBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!error && data) {
      const { data: pubData } = supabaseAdmin.storage
        .from('report-images')
        .getPublicUrl(filename);

      if (pubData?.publicUrl) {
        return {
          relativeUrl: pubData.publicUrl,
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: outputBuffer.length,
        };
      }
    } else if (error) {
      console.warn('Supabase storage upload failed, falling back to local:', error.message);
    }
  } catch (err) {
    console.warn('Supabase upload exception, falling back to local disk:', err);
  }

  // في حال تعذر Supabase، الحفظ محلياً
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reports', 'images');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, outputBuffer);

    return {
      relativeUrl: `/uploads/reports/images/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: outputBuffer.length,
    };
  } catch (localErr) {
    console.error('Failed to save image locally:', localErr);
    throw new Error('فشل في حفظ الصورة');
  }
}
