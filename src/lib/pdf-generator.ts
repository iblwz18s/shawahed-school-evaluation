import path from 'path';
import fs from 'fs/promises';
import { supabaseAdmin } from './supabase';

export interface GeneratePdfOptions {
  filenamePrefix?: string;
}

export async function generatePdfFromHtml(
  htmlContent: string,
  options: GeneratePdfOptions = {}
): Promise<{ relativeUrl: string; filePath: string; size: number }> {
  const { filenamePrefix = 'report' } = options;

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${filenamePrefix}_${uniqueSuffix}.pdf`;

  let browser;
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    if (isServerless) {
      // بيئة Vercel Serverless
      const chromium = (await import('@sparticuz/chromium')).default;
      const { chromium: playwrightCore } = await import('playwright-core');

      // إعداد بيئة Chromium الخفيفة
      chromium.setGraphicsMode = false;

      let executablePath: string | undefined;

      // 1. فحص مجلد bin المحلي إذا كان متاحاً في بيئة التشغيل
      const localBin = path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium', 'bin');
      try {
        const fsSync = await import('fs');
        if (fsSync.existsSync(localBin)) {
          executablePath = await chromium.executablePath(localBin);
        }
      } catch (binErr) {
        console.warn('Local bin check failed:', binErr);
      }

      // 2. إذا لم يتوفر، استدعاء executablePath() القياسي
      if (!executablePath) {
        try {
          executablePath = await chromium.executablePath();
        } catch (defErr) {
          console.warn('Default chromium.executablePath() failed, trying remote pack:', defErr);
          // 3. رابط حزمة Chromium البديل عند الحاجة
          try {
            executablePath = await chromium.executablePath(
              'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
            );
          } catch (urlErr) {
            console.error('Remote executablePath failed:', urlErr);
          }
        }
      }

      if (!executablePath) {
        throw new Error('تعذر العثور على محرك تشغيل Chromium في بيئة السيرفر');
      }

      browser = await playwrightCore.launch({
        args: [...chromium.args, '--font-render-hinting=none', '--no-sandbox', '--disable-setuid-sandbox'],
        executablePath,
        headless: true,
      });
    } else {
      // البيئة المحلية (Windows / Mac / Linux)
      const { chromium } = await import('playwright');
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
      } catch {
        try {
          browser = await chromium.launch({ channel: 'msedge', headless: true });
        } catch {
          browser = await chromium.launch({ headless: true });
        }
      }
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    // إدخال محتوى الـ HTML والانتظار حتى تحميل الصفحة
    await page.setContent(htmlContent, {
      waitUntil: 'load',
      timeout: 25000,
    });

    // توليد PDF وفق المواصفات المحددة في الوثيقة:
    // format: A4, printBackground: true, preferCSSPageSize: true
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    await browser.close();
    browser = undefined;

    let finalUrl = `/uploads/reports/pdf/${filename}`;
    let savedFilePath = '';

    // رفع الملف إلى Supabase Storage أولاً
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('report-pdfs')
        .upload(filename, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!error && data) {
        const { data: pubData } = supabaseAdmin.storage
          .from('report-pdfs')
          .getPublicUrl(filename);
        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase PDF upload error:', error.message);
      }
    } catch (storageErr) {
      console.warn('Supabase storage exception for PDF:', storageErr);
    }

    // حفظ نسخة محلية أيضاً إن أمكن (لتوافق المسارات المحلية)
    try {
      const pdfDir = path.join(process.cwd(), 'public', 'uploads', 'reports', 'pdf');
      await fs.mkdir(pdfDir, { recursive: true });
      savedFilePath = path.join(pdfDir, filename);
      await fs.writeFile(savedFilePath, pdfBuffer);
    } catch {
      // في بيئات serverless قد تكون مجلدات public للقراءة فقط
      savedFilePath = path.join('/tmp', filename);
      try {
        await fs.writeFile(savedFilePath, pdfBuffer);
      } catch {}
    }

    return {
      relativeUrl: finalUrl,
      filePath: savedFilePath,
      size: pdfBuffer.length,
    };
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    console.error('PDF generation error:', error);
    throw error;
  }
}
