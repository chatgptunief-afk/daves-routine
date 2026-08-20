const { chromium } = require('playwright');
const path = require('path');

// De oorspronkelijke Dagboog-icoon-scène: dezelfde inktlucht + Boog + lichtpunt als de app
// zelf (arcGrad/lightCore, exact dezelfde kleuren als Arc.tsx) — een miniatuur van het echte
// widget, geen los logo. Hersteld op verzoek na de FLAi-icoonpoging; nu verfijnd: een subtiele
// vignette voor diepte, en een aparte, vereenvoudigde tekening voor de kleinste formaten
// (favicon) i.p.v. gewoon de grote scène plat verkleinen.
function scene({ vignette = true } = {}) {
  return `
<defs>
  <radialGradient id="bg" cx="62%" cy="36%" r="75%">
    <stop offset="0%" stop-color="#1B1926" />
    <stop offset="55%" stop-color="#111019" />
    <stop offset="100%" stop-color="#07070C" />
  </radialGradient>
  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#C9752F" />
    <stop offset="62%" stop-color="#E8934A" />
    <stop offset="100%" stop-color="#F2AC6E" />
  </linearGradient>
  <radialGradient id="lightCore" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FFFBF2" />
    <stop offset="55%" stop-color="#F5F1E8" />
    <stop offset="100%" stop-color="#F5F1E8" stop-opacity="0" />
  </radialGradient>
  <radialGradient id="horizonGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#E8934A" stop-opacity="0.5" />
    <stop offset="100%" stop-color="#E8934A" stop-opacity="0" />
  </radialGradient>
  <radialGradient id="vignette" cx="50%" cy="46%" r="72%">
    <stop offset="0%" stop-color="#000000" stop-opacity="0" />
    <stop offset="78%" stop-color="#000000" stop-opacity="0" />
    <stop offset="100%" stop-color="#000000" stop-opacity="0.28" />
  </radialGradient>
  <filter id="softBloom" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="12" />
  </filter>
  <filter id="lightBloom" x="-250%" y="-250%" width="600%" height="600%">
    <feGaussianBlur stdDeviation="16" />
  </filter>
  <filter id="fineGrain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
  </filter>
</defs>

<rect x="0" y="0" width="512" height="512" fill="url(#bg)" />
<circle cx="320" cy="167" r="230" fill="url(#horizonGlow)" opacity="0.55" />

<path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="rgba(245,241,232,0.16)" stroke-width="7" stroke-linecap="round" />
<path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="url(#arcGrad)" stroke-width="26"
      stroke-linecap="round" stroke-dasharray="341 550" opacity="0.30" filter="url(#softBloom)" />
<path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="url(#arcGrad)" stroke-width="11" stroke-linecap="round" stroke-dasharray="341 550" />

<circle cx="320" cy="167" r="46" fill="url(#lightCore)" opacity="0.55" filter="url(#lightBloom)" />
<circle cx="320" cy="167" r="13" fill="#FFFBF2" />

<rect x="0" y="0" width="512" height="512" filter="url(#fineGrain)" opacity="0.5" />
${vignette ? '<rect x="0" y="0" width="512" height="512" fill="url(#vignette)" />' : ''}
`;
}

function buildSvg({ size, rx, scale, vignette }) {
  const dx = (512 - 512 * scale) / 2;
  const dy = (512 - 512 * scale) / 2;
  const rectEl = rx
    ? `<clipPath id="roundedClip"><rect width="512" height="512" rx="${rx}" /></clipPath>`
    : '';
  const clipAttr = rx ? ' clip-path="url(#roundedClip)"' : '';
  return `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;}</style></head><body>
<svg id="out" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
<defs>${rectEl}</defs>
<g${clipAttr}>
  <g transform="translate(${dx.toFixed(2)},${dy.toFixed(2)}) scale(${scale})">
    ${scene({ vignette })}
  </g>
</g>
</svg></body></html>`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  const jobs = [
    // any-purpose: rounded square, volle schaal — dit is hoe de meeste Android-launchers 'm tonen
    { name: 'raw-app-icon.png', rx: 512 * 0.219, scale: 1.0 },
    // maskable: full-bleed, iets kleiner geschaald zodat de boog+lichtpunt ruim binnen elke
    // OEM-maskvorm blijven (cirkel, squircle, afgeronde rechthoek)
    { name: 'raw-maskable.png', rx: 0, scale: 0.9 },
  ];

  for (const job of jobs) {
    const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 4 });
    const html = buildSvg({ size: 512, rx: job.rx, scale: job.scale, vignette: true });
    await page.setContent(html);
    const el = await page.$('#out');
    await el.screenshot({ path: path.join(__dirname, '../public/icons', job.name) });
    await page.close();
    console.log('rendered', job.name);
  }

  await browser.close();
})();
