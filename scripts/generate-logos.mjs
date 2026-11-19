/**
 * Generates default logos for themes that don't have an official one yet
 * (public/themes/<theme>/logo.svg), plus theme textures: the fall-2026
 * foliage and the spring-2026 watercolor wash and map scrap.
 * Themes with an official logo (fall-2026, spring-2026) ship it as logo.png
 * and are not touched.
 *
 *   npm run logos
 *
 * Brand rule: the "DAI" wordmark is ALWAYS Open Sauce Sans Bold, at the same
 * size and position in every theme. A theme may only change the wordmark's
 * color (the `fill` below) and the artwork behind it. The letters are
 * converted to vector paths so they look identical everywhere, including
 * favicons, without depending on the font being installed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import opentype from "opentype.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontFile = path.join(root, "node_modules/@fontsource/open-sauce-sans/files/open-sauce-sans-latin-700-normal.woff");
const buf = readFileSync(fontFile);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// ---- the wordmark: fixed size and position, shared by every theme ----------
const WORD = "DAI";
// Matches the official logos: the wordmark spans ~27% of the square.
const WIDTH = 138; // px, in a 512×512 logo
const CENTER = [256, 256];

function wordmarkPath() {
  const draw = (x, y, size) => {
    const p = new opentype.Path();
    const scale = size / font.unitsPerEm;
    for (const ch of WORD) {
      const g = font.charToGlyph(ch);
      p.extend(g.getPath(x, y, size));
      x += g.advanceWidth * scale;
    }
    return p;
  };
  const bb0 = draw(0, 0, 100).getBoundingBox();
  const size = (100 * WIDTH) / (bb0.x2 - bb0.x1);
  const bb = draw(0, 0, size).getBoundingBox();
  const dx = CENTER[0] - (bb.x1 + bb.x2) / 2;
  const dy = CENTER[1] - (bb.y1 + bb.y2) / 2;
  return draw(dx, dy, size).toPathData(2);
}
const DAI = wordmarkPath();
const wordmark = (fill, extra = "") => `<path d="${DAI}" fill="${fill}"${extra}/>`;

// ---- helpers ------------------------------------------------------------------
let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = (n) => n.toFixed(1);

const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><defs><clipPath id="sq"><rect width="512" height="512" rx="104"/></clipPath>${defs}</defs><g clip-path="url(#sq)">${body}</g></svg>\n`;

/**
 * Autumn foliage: layers of small leaf shapes in the collage's palette.
 * Back layers are darker and blurred for depth; the front layer is crisp.
 */
export function foliage(w, h, density, s0 = 7, tile = false) {
  seed = s0;
  const leaf = "M0 -1C.55 -.55 .55 .45 0 1C-.55 .45-.55-.55 0-1Z";
  const palettes = [
    ["#5a1f0b", "#7a2c0e", "#8f3a10", "#6b4a1a"],
    ["#b8420f", "#c9551a", "#a8360c", "#d06a1c", "#8e2b0c"],
    ["#e8761e", "#f08c22", "#f3a42c", "#f6bd3c", "#e35f17", "#f8d25a", "#c4401a", "#fbe08a"],
  ];
  const layer = (n, pal, sMin, sMax, blur) => {
    let out = `<g${blur ? ` filter="url(#leafblur)"` : ""}>`;
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, y = rnd() * h, sc = sMin + rnd() * (sMax - sMin), rot = rnd() * 360;
      const fill = pal[Math.floor(rnd() * pal.length)];
      // For a seamless tile, leaves near an edge are repeated on the opposite side.
      const xs = tile ? [x, x - w, x + w].filter((v) => v > -sMax && v < w + sMax) : [x];
      const ys = tile ? [y, y - h, y + h].filter((v) => v > -sMax && v < h + sMax) : [y];
      for (const px of xs) for (const py of ys)
        out += `<path d="${leaf}" fill="${fill}" transform="translate(${r1(px)} ${r1(py)}) rotate(${rot.toFixed(0)}) scale(${(sc * 0.85).toFixed(1)} ${sc.toFixed(1)})"/>`;
    }
    return out + "</g>";
  };
  const area = (w * h) / 10000;
  return `<rect width="${w}" height="${h}" fill="#3a1508"/>` +
    layer(Math.round(area * density * 0.35), palettes[0], 22, 36, true) +
    layer(Math.round(area * density * 0.5), palettes[1], 16, 28, false) +
    layer(Math.round(area * density), palettes[2], 11, 21, false);
}
const leafBlur = `<filter id="leafblur"><feGaussianBlur stdDeviation="2.5"/></filter>`;

const logos = {};

// WINTER: liquid chrome color on the wordmark, over a cyber grid.
logos["winter-2027"] = svg(`
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1526"/><stop offset="1" stop-color="#03060c"/></linearGradient>
  <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3b82f6" stop-opacity=".5"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#d4deec"/><stop offset=".47" stop-color="#76869f"/><stop offset=".52" stop-color="#2a3650"/><stop offset=".57" stop-color="#eef4ff"/><stop offset=".8" stop-color="#9fc3f2"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#8fb4e6" stroke-width="1" opacity=".14"/></pattern>`, `
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#grid)"/>
  <circle cx="256" cy="256" r="220" fill="url(#halo)"/>
  ${[[40, 40, 1, 1], [472, 40, -1, 1], [40, 472, 1, -1], [472, 472, -1, -1]].map(([x, y, sx, sy]) => `<path d="M${x} ${y + 34 * sy}V${y}H${x + 34 * sx}" fill="none" stroke="#9cc4f5" stroke-width="3" opacity=".75"/>`).join("")}
  ${wordmark("url(#chrome)")}`);

// SPRING: color explosion behind the wordmark (a remix of the original pastel logo).
{
  seed = 3;
  const blobs = [["#ff2d87", 110, 120, 190], ["#ff8a00", 420, 90, 170], ["#ffd400", 400, 400, 180], ["#3ddc84", 90, 420, 170], ["#00b8ff", 250, 250, 150], ["#8b5cf6", 470, 260, 130], ["#ff4d4d", 260, 500, 140]];
  const star = (cx, cy, a, b, n, rot) => Array.from({ length: n * 2 }, (_, i) => { const r = i % 2 ? b : a, t = (Math.PI * i) / n + rot; return `${r1(cx + r * Math.cos(t))},${r1(cy + r * Math.sin(t))}`; }).join(" ");
  const cols = ["#ff2d87", "#ffd400", "#00b8ff", "#3ddc84", "#ff8a00", "#8b5cf6", "#ffffff"];
  let confetti = "";
  for (let i = 0; i < 24; i++) {
    const a = rnd() * Math.PI * 2, d = 175 + rnd() * 90, x = 256 + Math.cos(a) * d, y = 256 + Math.sin(a) * d, c = cols[i % cols.length];
    confetti += i % 2 ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(4 + rnd() * 6)}" fill="${c}"/>` : `<rect x="-9" y="-3" width="18" height="6" rx="3" fill="${c}" transform="translate(${r1(x)} ${r1(y)}) rotate(${(a * 57).toFixed(0)})"/>`;
  }
  logos["spring-2027"] = svg(`
  ${blobs.map(([c], i) => `<radialGradient id="b${i}"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join("")}
  <filter id="swirl" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency=".008" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="70"/></filter>`, `
  <rect width="512" height="512" fill="#fff4e8"/>
  <g filter="url(#swirl)">${blobs.map(([, x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#b${i})"/>`).join("")}</g>
  <polygon points="${star(256, 256, 250, 150, 14, 0.1)}" fill="#ffffff" opacity=".3"/>
  ${confetti}
  ${wordmark("#e0136f")}`);
}

// MIDNIGHT (off-season)
logos["off-season"] = svg(`<radialGradient id="g" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".55" stop-color="#0d0d1a"/><stop offset="1" stop-color="#07070c"/></radialGradient>`, `
  <rect width="512" height="512" fill="url(#g)"/>
  ${wordmark("#ffffff")}`);

// ---- spring-2026 textures: watercolor wash and a vintage map scrap -----------
{
  seed = 412;
  const W = 1400, H = 900;
  const colors = ["#f7b3cd", "#d8c2f3", "#fcd2b2", "#fbe5a0", "#b7daf5", "#f39fc0", "#e6b6ea", "#c9e7c6"];
  let strokes = "";
  for (let i = 0; i < 72; i++) {
    const x = rnd() * W, y = rnd() * H, len = 260 + rnd() * 520, ang = -0.5 + rnd() * 0.7;
    const dx = Math.cos(ang) * len, dy = Math.sin(ang) * len, bend = (rnd() - 0.5) * 220;
    const c = colors[Math.floor(rnd() * colors.length)];
    strokes += `<path d="M${r1(x)} ${r1(y)}q${r1(dx / 2)} ${r1(dy / 2 + bend)} ${r1(dx)} ${r1(dy)}" stroke="${c}" stroke-width="${r1(50 + rnd() * 110)}" stroke-linecap="round" fill="none" opacity="${(0.45 + rnd() * 0.4).toFixed(2)}"/>`;
  }
  const wash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"><defs>
  <filter id="paint" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="9"/><feDisplacementMap in="SourceGraphic" scale="46"/><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .35  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs><rect width="${W}" height="${H}" fill="#f8eef3"/><g filter="url(#paint)">${strokes}</g><rect width="${W}" height="${H}" fill="#fff" filter="url(#grain)"/></svg>\n`;
  writeFileSync(path.join(root, "public/themes/spring-2026/watercolor.svg"), wash);
  console.log("public/themes/spring-2026/watercolor.svg");

  // Vintage map: wandering contour lines, a river, dashed roads.
  const MW = 520, MH = 380;
  const wander = (x, y, steps, step, turn) => {
    let a = rnd() * Math.PI * 2, d = `M${r1(x)} ${r1(y)}`;
    for (let i = 0; i < steps; i++) { a += (rnd() - 0.5) * turn; x += Math.cos(a) * step; y += Math.sin(a) * step; d += `L${r1(x)} ${r1(y)}`; }
    return d;
  };
  let lines = "";
  for (let i = 0; i < 26; i++) lines += `<path d="${wander(rnd() * MW, rnd() * MH, 30, 9, 0.7)}" stroke="#6f6450" stroke-width=".7" fill="none" opacity=".55"/>`;
  for (let i = 0; i < 5; i++) lines += `<path d="${wander(rnd() * MW, rnd() * MH, 40, 12, 0.35)}" stroke="#5a5040" stroke-width="1.1" stroke-dasharray="5 3" fill="none" opacity=".6"/>`;
  lines += `<path d="${wander(0, MH * 0.6, 60, 10, 0.4)}" stroke="#7a9cb0" stroke-width="2.4" fill="none" opacity=".55"/>`;
  for (let i = 0; i < 9; i++) lines += `<circle cx="${r1(rnd() * MW)}" cy="${r1(rnd() * MH)}" r="2.2" fill="#5a5040" opacity=".6"/>`;
  const map = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" width="${MW}" height="${MH}"><rect width="${MW}" height="${MH}" fill="#efe7d6"/>${lines}</svg>\n`;
  writeFileSync(path.join(root, "public/themes/spring-2026/map.svg"), map);
  console.log("public/themes/spring-2026/map.svg");
}

// Seamless foliage tile for the fall theme's hero background.
{
  const T = 560;
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${T}" height="${T}"><defs>${leafBlur}</defs>${foliage(T, T, 22, 77, true)}</svg>\n`;
  writeFileSync(path.join(root, "public/themes/fall-2026/foliage.svg"), tile);
  console.log("public/themes/fall-2026/foliage.svg");
}

for (const [name, content] of Object.entries(logos)) {
  writeFileSync(path.join(root, "public/themes", name, "logo.svg"), content);
  console.log(`public/themes/${name}/logo.svg`);
}
