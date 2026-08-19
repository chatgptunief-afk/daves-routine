const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'icon-source.html'));
  const el = await page.$('#icon');
  await el.screenshot({ path: path.join(__dirname, '../public/icons/icon-512.png') });
  await browser.close();
  console.log('done');
})();
