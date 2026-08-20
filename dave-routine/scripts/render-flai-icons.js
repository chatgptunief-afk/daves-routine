const { chromium } = require('playwright');
const path = require('path');

const BBOX = { x: 6, y: 16, width: 238, height: 209 };
const cx = BBOX.x + BBOX.width / 2;
const cy = BBOX.y + BBOX.height / 2;

const MARK = `
<defs>
  <linearGradient id="bM" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="248" y2="8">
    <stop offset="0" stop-color="#C9752F"/>
    <stop offset="0.55" stop-color="#E8934A"/>
    <stop offset="1" stop-color="#F2AC6E"/>
  </linearGradient>
  <linearGradient id="aM" gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="110" y2="104">
    <stop offset="0" stop-color="#E8934A"/>
    <stop offset="1" stop-color="#FFFBF2"/>
  </linearGradient>
  <filter id="gl" filterUnits="userSpaceOnUse" x="-40" y="-40" width="360" height="360">
    <feGaussianBlur stdDeviation="4.5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="12">
<path d="M44 52 H96" stroke="url(#bM)"/>
<circle cx="26" cy="52" r="12" fill="none" stroke="url(#bM)" stroke-width="9"/>
<path d="M6 88 H96" stroke="url(#aM)" filter="url(#gl)"/>
<path d="M62 128 H96" stroke="url(#bM)"/>
<path d="M50 206 H62 L86 170 H96" stroke="url(#bM)"/>
<circle cx="26" cy="206" r="12" fill="none" stroke="url(#bM)" stroke-width="9"/>
<path d="M124 192 H164 L184 212 H196" stroke="url(#bM)"/>
<circle cx="214" cy="212" r="13" fill="none" stroke="url(#bM)" stroke-width="9"/>
<circle cx="214" cy="212" r="4.5" fill="url(#aM)" filter="url(#gl)"/>
<path d="M96 40 L196 40 C214 40 228 32 244 16 L210 68 L124 68 L124 114 L196 114 L178 142 L124 142 L124 216 L96 216 Z" fill="url(#bM)" stroke="url(#bM)" stroke-width="7" stroke-linejoin="round"/>
<circle cx="110" cy="60" r="10.5" fill="#0A0A0F"/>
<circle cx="110" cy="196" r="10.5" fill="#0A0A0F"/>
</g>`;

function buildSvg({ size, rx, markFraction }) {
  const scale = (size * markFraction) / BBOX.width;
  const tx = size / 2 - cx * scale;
  const ty = size / 2 - cy * scale;
  const rectEl = rx
    ? `<rect width="${size}" height="${size}" rx="${rx}" fill="#0A0A0F"/>`
    : `<rect width="${size}" height="${size}" fill="#0A0A0F"/>`;
  return `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;}</style></head><body>
<svg id="out" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${rectEl}
<g transform="translate(${tx.toFixed(3)},${ty.toFixed(3)}) scale(${scale.toFixed(5)})">${MARK}</g>
</svg></body></html>`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  const jobs = [
    // any-purpose icon: rounded square, matches FLAi's own "app-icon on Carbon" composition
    { name: 'raw-app-icon.png', size: 1024, rx: 1024 * 0.219, markFraction: 0.60 },
    // maskable: full-bleed square, mark well within the 80% safe circle
    { name: 'raw-maskable.png', size: 1024, rx: 0, markFraction: 0.64 },
  ];

  for (const job of jobs) {
    const page = await browser.newPage({
      viewport: { width: job.size, height: job.size },
      deviceScaleFactor: 2,
    });
    const html = buildSvg(job);
    await page.setContent(html);
    const el = await page.$('#out');
    await el.screenshot({ path: path.join(__dirname, '../public/icons', job.name) });
    await page.close();
    console.log('rendered', job.name);
  }

  await browser.close();
})();
