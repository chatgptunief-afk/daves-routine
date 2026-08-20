const { chromium } = require('playwright');
const path = require('path');

const html = `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;}</style></head><body>
<svg id="out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
<defs>
  <linearGradient id="bM" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="248" y2="8">
    <stop offset="0" stop-color="#7C3AED"/>
    <stop offset="0.34" stop-color="#4F46E5"/>
    <stop offset="0.66" stop-color="#2563EB"/>
    <stop offset="1" stop-color="#22D3EE"/>
  </linearGradient>
  <linearGradient id="aM" gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="110" y2="104">
    <stop offset="0" stop-color="#A855F7"/>
    <stop offset="1" stop-color="#22D3EE"/>
  </linearGradient>
</defs>
<rect width="512" height="512" rx="14" fill="#0A0A0F"/>
<g transform="translate(-1.3,3.8) scale(0.243)">
  <path d="M30 88 H96" stroke="url(#aM)" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M96 40 L196 40 C214 40 228 32 244 16 L210 68 L124 68 L124 114 L196 114 L178 142 L124 142 L124 216 L96 216 Z" fill="url(#bM)" stroke="url(#bM)" stroke-width="7" stroke-linejoin="round"/>
</g>
</svg>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent(html.replace('width="512" height="512" viewBox', 'width="256" height="256" viewBox'));
  const el = await page.$('#out');
  await el.screenshot({ path: path.join(__dirname, 'raw-favicon.png') });
  await browser.close();
  console.log('done');
})();
