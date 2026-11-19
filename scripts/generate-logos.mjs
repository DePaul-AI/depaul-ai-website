/**
 * Generates the built-in theme logos in public/logos/<theme>.svg.
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
const WIDTH = 300; // px, in a 512×512 logo
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

/** Points along a line with a ragged, hand-torn wobble. */
function tornLine(x0, y0, x1, y1, steps, amp) {
  const pts = [];
  const nx = -(y1 - y0), ny = x1 - x0, len = Math.hypot(nx, ny);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, j = (rnd() - 0.5) * amp + (rnd() < 0.15 ? (rnd() - 0.5) * amp * 2 : 0);
    pts.push([x0 + (x1 - x0) * t + (nx / len) * j, y0 + (y1 - y0) * t + (ny / len) * j]);
  }
  return pts;
}
const poly = (pts) => "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";

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

const foliageFilter = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/>
    <feColorMatrix values="0 0 0 0 .1  0 0 0 0 .07  0 0 0 0 .04  0 0 0 .35 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#1a0d05" flood-opacity=".45"/></filter>`;

const logos = {};

// FALL: torn-paper collage. Foliage, a black torn band, a cobalt scrap, magazine text.
{
  seed = 21;
  const band = [...tornLine(-20, 150, 532, 170, 28, 10), ...tornLine(532, 362, -20, 345, 28, 10)];
  const rim = [...tornLine(-20, 144, 532, 163, 28, 7), ...tornLine(532, 369, -20, 352, 28, 7)];
  const blue = [...tornLine(330, 388, 470, 402, 8, 6), ...tornLine(470, 470, 336, 462, 8, 6)];
  const mag = [...tornLine(18, 30, 196, 18, 9, 5), ...tornLine(205, 120, 24, 132, 9, 5)];
  let lines = "";
  for (let y = 46; y < 118; y += 9) lines += `<rect x="36" y="${y}" width="${150 - (y % 27)}" height="3.4" fill="#2a221a" opacity=".55" transform="rotate(-3.5 110 75)"/>`;
  const leaves = foliage(512, 512, 22, 31);
  seed = 21;
  logos.fall = svg(foliageFilter + leafBlur, `
  ${leaves}
  <g filter="url(#shadow)"><path d="${poly(mag)}" fill="#f3ead8"/>${lines}</g>
  <g filter="url(#shadow)"><path d="${poly(blue)}" fill="#2f5bd3"/></g>
  <g filter="url(#shadow)"><path d="${poly(rim)}" fill="#f6efe1"/><path d="${poly(band)}" fill="#14110e"/></g>
  <rect width="512" height="512" fill="#fff" filter="url(#grain)"/>
  ${wordmark("#f6efe1")}`);
}

// WINTER: liquid chrome color on the wordmark, over a cyber grid.
logos.winter = svg(`
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1526"/><stop offset="1" stop-color="#03060c"/></linearGradient>
  <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3b82f6" stop-opacity=".5"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
  <linearGradient id="chrome" x1="0" y1="190" x2="0" y2="322" gradientUnits="userSpaceOnUse">
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
  logos.spring = svg(`
  ${blobs.map(([c], i) => `<radialGradient id="b${i}"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join("")}
  <filter id="swirl" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency=".008" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="70"/></filter>`, `
  <rect width="512" height="512" fill="#fff4e8"/>
  <g filter="url(#swirl)">${blobs.map(([, x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#b${i})"/>`).join("")}</g>
  <polygon points="${star(256, 256, 250, 150, 14, 0.1)}" fill="#ffffff" opacity=".3"/>
  ${confetti}
  ${wordmark("#e0136f")}`);
}

// SUMMER
logos.summer = svg(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf6b"/><stop offset=".6" stop-color="#ff8f5a"/><stop offset="1" stop-color="#1fb5ac"/></linearGradient>`, `
  <rect width="512" height="512" fill="url(#sky)"/><circle cx="256" cy="290" r="150" fill="#fff3c4" opacity=".55"/>
  ${wordmark("#14322f")}`);

// MIDNIGHT (off-season)
logos.midnight = svg(`<radialGradient id="g" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".55" stop-color="#0d0d1a"/><stop offset="1" stop-color="#07070c"/></radialGradient>`, `
  <rect width="512" height="512" fill="url(#g)"/>
  ${wordmark("#ffffff")}`);

// Seamless foliage tile for the fall theme's hero background.
{
  const T = 560;
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${T}" height="${T}"><defs>${leafBlur}</defs>${foliage(T, T, 22, 77, true)}</svg>\n`;
  writeFileSync(path.join(root, "public/themes/fall-foliage.svg"), tile);
  console.log("public/themes/fall-foliage.svg");
}

for (const [name, content] of Object.entries(logos)) {
  writeFileSync(path.join(root, "public/logos", `${name}.svg`), content);
  console.log(`public/logos/${name}.svg`);
}
