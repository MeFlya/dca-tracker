// Lecture minimale d'un PNG (8 bits, RGB ou RGBA) : sert à comparer deux images
// de contrôle pixel par pixel (scripts/rendre.mjs), sans dépendance.

import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
export function lirePng(fichier) {
  const b = readFileSync(fichier);
  let p = 8, w, h, bd, ct; const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p); const type = b.toString("ascii", p + 4, p + 8);
    const data = b.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    if (type === "IDAT") idat.push(data);
    p += 12 + len;
  }
  if (bd !== 8) throw new Error("bit depth " + bd);
  const bpp = { 2: 3, 6: 4, 0: 1, 4: 2 }[ct];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp; const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; const src = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const up = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[src + x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pp = a + up - c; const pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, get(x, y) { const i = (y * w + x) * bpp; return [px[i], px[i + 1], px[i + 2]]; } };
}
export function boite(img, test, zone = [0, 0, img.w, img.h]) {
  let x1 = 1e9, y1 = 1e9, x2 = -1, y2 = -1, n = 0;
  for (let y = zone[1]; y < zone[3]; y++) for (let x = zone[0]; x < zone[2]; x++) {
    if (test(...img.get(x, y))) { n++; if (x < x1) x1 = x; if (y < y1) y1 = y; if (x > x2) x2 = x; if (y > y2) y2 = y; }
  }
  return { x1, y1, x2, y2, n };
}
