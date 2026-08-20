const { chromium } = require('playwright');
const path = require('path');

// Aparte, vereenvoudigde tekening voor de kleinste formaten (favicon 16-48px) i.p.v. de grote
// scène plat verkleinen — bij 16px verdwijnt fijne gloed/korrel toch, dus: kortere, dikkere
// boog, groter lichtpunt, strakkere (kleinere) bloom, geen korrel.
const html = `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;}</style></head><body>
<svg id="out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
<defs>
  <radialGradient id="bg" cx="60%" cy="34%" r="80%">
    <stop offset="0%" stop-color="#1B1926" />
    <stop offset="60%" stop-color="#111019" />
    <stop offset="100%" stop-color="#07070C" />
  </radialGradient>
  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#C9752F" />
    <stop offset="60%" stop-color="#E8934A" />
    <stop offset="100%" stop-color="#F2AC6E" />
  </linearGradient>
  <filter id="lightBloom" x="-200%" y="-200%" width="500%" height="500%">
    <feGaussianBlur stdDeviation="2.4" />
  </filter>
</defs>
<rect width="64" height="64" rx="14" fill="url(#bg)" />
<path d="M 11 43 A 22 22 0 0 1 51 43" fill="none" stroke="rgba(245,241,232,0.18)" stroke-width="3" stroke-linecap="round" />
<path d="M 11 43 A 22 22 0 0 1 51 43" fill="none" stroke="url(#arcGrad)" stroke-width="4.6" stroke-linecap="round" stroke-dasharray="43 70" />
<circle cx="40.5" cy="21.5" r="7.5" fill="#F2AC6E" opacity="0.5" filter="url(#lightBloom)" />
<circle cx="40.5" cy="21.5" r="3.6" fill="#FFFBF2" />
</svg>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent(html);
  const el = await page.$('#out');
  await el.screenshot({ path: path.join(__dirname, 'raw-favicon.png') });
  await browser.close();
  console.log('done');
})();
