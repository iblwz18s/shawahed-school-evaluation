import { chromium } from 'playwright';

async function testBrowser() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.message}`));
  page.on('requestfailed', req => consoleLogs.push(`[REQ FAILED] ${req.url()} - ${req.failure()?.errorText}`));
  page.on('response', res => {
    if (res.status() >= 400) {
      consoleLogs.push(`[HTTP ${res.status()}] ${res.url()}`);
    }
  });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/login');
  
  // Login as teacher
  await page.click('button:has-text("حساب المعلم")');
  await page.click('button:has-text("تسجيل الدخول")');
  await page.waitForURL('**/staff', { timeout: 10000 });
  console.log('Logged in as teacher! Current URL:', page.url());

  // Go to an indicator page
  await page.goto('http://localhost:3000/indicators/1-1-1-1');
  await page.waitForLoadState('networkidle');
  console.log('Loaded indicator page:', page.url());

  // Click "+ إضافة شاهد"
  const addBtn = page.locator('button:has-text("إضافة شاهد لهذا المؤشر")').first();
  await addBtn.click();
  console.log('Clicked "+ إضافة شاهد لهذا المؤشر"');
  await page.waitForTimeout(500);

  // Click "إنشاء تقرير"
  const reportChoiceBtn = page.locator('button:has-text("إنشاء تقرير")');
  await reportChoiceBtn.click();
  console.log('Clicked "إنشاء تقرير"');
  await page.waitForTimeout(1000);

  // Fill in title
  const titleInput = page.locator('input[placeholder*="مثال:"]').first();
  await titleInput.fill('برنامج الاحتفاء باليوم الوطني');
  console.log('Filled title input');
  
  // Click "معاينة حية"
  console.log('Clicking "معاينة حية"...');
  const previewBtn = page.locator('button:has-text("معاينة حية")').first();
  await previewBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'public/uploads/debug_preview.png' });
  console.log('Captured preview screenshot at public/uploads/debug_preview.png');

  console.log('Console and Network logs:');
  consoleLogs.forEach(l => console.log('  ', l));

  // Check iframe content in preview
  const iframeElement = await page.$('iframe[title="Live Preview"]');
  if (iframeElement) {
    const iframeContent = await iframeElement.getAttribute('srcdoc');
    console.log('Iframe srcdoc exists? Length:', iframeContent ? iframeContent.length : 0);
  } else {
    console.log('Iframe element not found!');
  }

  await browser.close();
}

testBrowser().catch(err => {
  console.error('Fatal test browser error:', err);
  process.exit(1);
});
