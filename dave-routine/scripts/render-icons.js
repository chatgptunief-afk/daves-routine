// Herstelt de iconen: de vorige generator tekende de scène binnen een afgeronde <rect rx="..">
// en liet de hoeken daarbuiten leeg. Bij het platslaan naar een ondoorzichtige PNG (geen alfa-
// kanaal, hasAlpha:false in alle bestaande bestanden) werden die lege hoeken wit in plaats van
// de achtergrondkleur — precies de witte rand die op het beginscherm te zien is.
//
// Fix: nooit transparantie renderen. Elke variant vult het volledige canvas rand-tot-rand met
// de achtergrond-gradient; voor "any purpose"-iconen (apple-touch-icon, icon-192/512) wordt er
// geen ronding meer in de afbeelding zelf getekend — dat is precies wat Apple/Android zelf al
// doen bij het plaatsen op een beginscherm. Voor maskable iconen blijft de scène verkleind
// binnen de safe zone, maar de achtergrond zelf loopt gewoon door tot de rand.
const sharp = require('sharp');
const path = require('path');

function scene({ scale = 1, translate = 0 } = {}) {
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
  <filter id="softBloom" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="12" />
  </filter>
  <filter id="lightBloom" x="-250%" y="-250%" width="600%" height="600%">
    <feGaussianBlur stdDeviation="16" />
  </filter>
</defs>

<!-- Achtergrond loopt ALTIJD rand-tot-rand, buiten de geschaalde/vertaalde groep om -->
<rect x="0" y="0" width="512" height="512" fill="url(#bg)" />

<g transform="translate(${translate},${translate}) scale(${scale})">
  <circle cx="320" cy="167" r="230" fill="url(#horizonGlow)" opacity="0.55" />
  <path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="rgba(245,241,232,0.16)" stroke-width="7" stroke-linecap="round" />
  <path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="url(#arcGrad)" stroke-width="26"
        stroke-linecap="round" stroke-dasharray="341 550" opacity="0.30" filter="url(#softBloom)" />
  <path d="M 81 330 A 175 175 0 0 1 431 330" fill="none" stroke="url(#arcGrad)" stroke-width="11" stroke-linecap="round" stroke-dasharray="341 550" />
  <circle cx="320" cy="167" r="46" fill="url(#lightCore)" opacity="0.55" filter="url(#lightBloom)" />
  <circle cx="320" cy="167" r="13" fill="#FFFBF2" />
</g>
`;
}

function svgFull(scale = 1) {
  // scale<1 schaalt de scène (arc+lichtpunt) t.o.v. het midden van het 512x512-canvas, maar
  // de achtergrond-rect hierboven blijft ALTIJD 512x512 — dat is precies het verschil met de
  // vorige generator, waar de achtergrond mee verkleinde en dus een lege rand achterliet.
  const translate = (512 - 512 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${scene({ scale, translate })}</svg>`;
}

function svgFavicon() {
  // Kleinere formaten: kortere/dikkere boog, groter lichtpunt, geen fijne details die toch
  // verdwijnen. Ronde hoeken blijven hier prima (browsertabs passen geen eigen masker toe),
  // maar het canvas erbuiten is nu ook echt de achtergrondkleur, niet transparant.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
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
</svg>`;
}

// Bouwt een minimale, geldige .ico met ingebedde PNG's (ondersteund door alle moderne browsers
// en Windows sinds Vista) — geen extra npm-package nodig.
function buildIco(pngBuffers /* [{ size, buffer }] */) {
  const count = pngBuffers.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  const datas = [];
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(buffer.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset
    offset += buffer.length;
    entries.push(entry);
    datas.push(buffer);
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

// Alle SVG's hierboven tekenen al vol-canvas, dus dit is puur een garantie: sharp geeft PNG's
// standaard een alfa-kanaal terug (elke pixel ondoorzichtig, maar het kanaal zelf blijft
// aanwezig). Apple's eigen richtlijn voor apple-touch-icon is expliciet "geen alfa-kanaal" —
// flatten() verwijdert het kanaal volledig i.p.v. alleen elke pixel op 255 te zetten.
const BG = '#07070c';
function renderOpaque(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).flatten({ background: BG }).png();
}

// favicon.ico specifiek: Next.js' eigen build-time image-processor (Turbopack) eist dat de
// ingebedde PNG's in RGBA zitten (alfa-kanaal aanwezig, ongeacht of elke pixel ondoorzichtig
// is) — flatten() zou de build breken. Dat is een ander vereiste dan Apple's "geen alfa-kanaal"
// voor apple-touch-icon; hier blijft het kanaal dus staan. De SVG zelf heeft nergens
// transparante pixels (rand-tot-rand achtergrond), dus dit geeft functioneel hetzelfde
// resultaat — wél RGBA, maar overal alpha=255.
function renderOpaqueRgba(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).ensureAlpha().png();
}

(async () => {
  const iconsDir = path.join(__dirname, '../public/icons');
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../app');

  // "any purpose" — vol canvas, geen ronding gebakken in de afbeelding zelf.
  await renderOpaque(svgFull(1), 192).toFile(path.join(iconsDir, 'icon-192.png'));
  await renderOpaque(svgFull(1), 512).toFile(path.join(iconsDir, 'icon-512.png'));
  await renderOpaque(svgFull(1), 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // maskable — achtergrond vult het HELE canvas, scène verkleind binnen de safe zone (~80%).
  await renderOpaque(svgFull(0.72), 192).toFile(path.join(iconsDir, 'icon-192-maskable.png'));
  await renderOpaque(svgFull(0.72), 512).toFile(path.join(iconsDir, 'icon-512-maskable.png'));

  // favicon.ico — 16, 32 en 48px, ingebed als PNG's.
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const size of sizes) {
    const buffer = await renderOpaqueRgba(svgFavicon(), size).toBuffer();
    pngBuffers.push({ size, buffer });
  }
  const ico = buildIco(pngBuffers);
  require('fs').writeFileSync(path.join(appDir, 'favicon.ico'), ico);

  console.log('Alle iconen opnieuw gegenereerd, rand-tot-rand, geen transparantie/witte randen meer.');
})();
