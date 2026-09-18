const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const prisma = new PrismaClient();

async function uploadFile(bucket, localPath, destName, contentType) {
  if (!fs.existsSync(localPath)) return null;
  const buffer = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(destName, buffer, { upsert: true, contentType });

  if (error) {
    console.error(`Error uploading ${localPath} to ${bucket}/${destName}:`, error.message);
    return null;
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(destName);
  return pub.publicUrl;
}

async function main() {
  console.log('Syncing images to report-images...');
  const imagesDir = path.join(process.cwd(), 'public', 'uploads', 'reports', 'images');
  const imageUrlMap = {};
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    for (const f of files) {
      const fullPath = path.join(imagesDir, f);
      const url = await uploadFile('report-images', fullPath, f, 'image/webp');
      if (url) {
        imageUrlMap[`/uploads/reports/images/${f}`] = url;
      }
    }
  }

  console.log('Syncing PDFs to report-pdfs...');
  const pdfsDir = path.join(process.cwd(), 'public', 'uploads', 'reports', 'pdf');
  const pdfUrlMap = {};
  if (fs.existsSync(pdfsDir)) {
    const files = fs.readdirSync(pdfsDir);
    for (const f of files) {
      const fullPath = path.join(pdfsDir, f);
      const url = await uploadFile('report-pdfs', fullPath, f, 'application/pdf');
      if (url) {
        pdfUrlMap[`/uploads/reports/pdf/${f}`] = url;
      }
    }
  }

  console.log('Syncing school assets...');
  const logoPath = path.join(process.cwd(), 'public', 'images', 'moe-logo.png');
  let ministryLogoSupabaseUrl = null;
  if (fs.existsSync(logoPath)) {
    ministryLogoSupabaseUrl = await uploadFile('school-assets', logoPath, 'moe-logo.png', 'image/png');
    console.log('Ministry logo Supabase URL:', ministryLogoSupabaseUrl);
  }

  console.log('Updating Evidence records with Supabase URLs...');
  const evidences = await prisma.evidence.findMany();
  for (const ev of evidences) {
    let updated = false;
    let newPdfUrl = ev.pdfUrl;
    let newReportData = ev.reportData;

    if (ev.pdfUrl && pdfUrlMap[ev.pdfUrl]) {
      newPdfUrl = pdfUrlMap[ev.pdfUrl];
      updated = true;
    }

    if (ev.reportData) {
      try {
        let repObj = JSON.parse(ev.reportData);
        let repUpdated = false;
        if (Array.isArray(repObj.evidenceImages)) {
          repObj.evidenceImages = repObj.evidenceImages.map(img => {
            if (imageUrlMap[img]) {
              repUpdated = true;
              return imageUrlMap[img];
            }
            return img;
          });
        }
        if (repUpdated) {
          newReportData = JSON.stringify(repObj);
          updated = true;
        }
      } catch (e) {}
    }

    if (updated) {
      await prisma.evidence.update({
        where: { id: ev.id },
        data: {
          pdfUrl: newPdfUrl,
          reportData: newReportData
        }
      });
    }
  }

  if (ministryLogoSupabaseUrl) {
    await prisma.schoolSetting.updateMany({
      data: {
        ministryLogoUrl: ministryLogoSupabaseUrl
      }
    });
  }

  console.log('Asset sync and URL updates finished successfully!');
}

main().finally(() => prisma.$disconnect());
