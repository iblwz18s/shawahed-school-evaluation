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

      // إعداد خطوط عربية وتجاوز بيئة التشفير
      chromium.setGraphicsMode = false;
      const executablePath = await chromium.executablePath();

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

    // إدخال محتوى الـ HTML والانتظار حتى تحميل الشبكة والخطوط
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle',
      timeout: 30000,
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
