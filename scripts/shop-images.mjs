// Web versions of the shop photos (photos/*.jpg, the originals) for /products and /vapes:
// .webp (q82) + .jpg fallback, cards ≤ 1000px and heroes ≤ 1600px on the long side, plus a
// transparent cut-out of the joint photos (the Products cards show them on a dark backdrop).
// Image sizes go to src/data/shop-image-sizes.json (for width/height attributes: no layout shift).
//
//   node scripts/shop-images.mjs
//
// Sources (Pinterest pins → their og:image, the i.pinimg.com "originals" file):
//   products-hero  pin.it/5hm0BCmCY  i.pinimg.com/originals/51/e4/d2/51e4d2a19511c4988a56d3c71505e005.jpg
//   joint-a        pin.it/6EuGRyMne  i.pinimg.com/originals/ef/0d/28/ef0d28e561f26a6fe4fd6bd51bdadea2.jpg
//   joint-b        pin.it/7LjoQfB7v  i.pinimg.com/originals/0a/3d/a7/0a3da72828779c5ca3f1ff4e0cc9ad5b.jpg
//   vapes-hero     pin.it/38Wb79MMe  i.pinimg.com/originals/3f/0d/b4/3f0db4535dafbae2c40c7c0fa554092a.jpg
//   vape-a         pin.it/2UJztpnvz  i.pinimg.com/originals/eb/96/c9/eb96c9f8f4bac2fd67fb4a59660cabe9.jpg
//   vape-b         pin.it/3rs12mDFo  i.pinimg.com/originals/ef/cd/19/efcd19e9a8dbf316843b8170122b7a48.jpg
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const IMAGES = [
  { name: "products-hero", dir: "joints", max: 1600 },
  { name: "joint-a", dir: "joints", max: 1000, cutout: { whiteMin: 222 } },
  { name: "joint-b", dir: "joints", max: 1000, cutout: { whiteMin: 232 } },
  { name: "vapes-hero", dir: "vapes", max: 1600 },
  { name: "vape-a", dir: "vapes", max: 1000 },
  { name: "vape-b", dir: "vapes", max: 1000 },
];

// Cut-out, like scripts/cutout-joint.mjs but without the rotation, and keeping every sizeable
// object (joint-a is five joints in a row): flood-fill near-white from the edges, keep objects of
// at least 3% of the largest, erode 1px, feather, and un-mix the white from the soft edge.
async function cutout(input, { whiteMin, maxSat = 26 }) {
  const { data: rgb, info } = await sharp(input).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const N = W * H;
  const isWhite = (i) => {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const lo = Math.min(r, g, b);
    return lo >= whiteMin && Math.max(r, g, b) - lo <= maxSat;
  };
  const bg = new Uint8Array(N);
  const queue = new Int32Array(N);
  let head = 0, tail = 0;
  const seed = (i) => {
    if (!bg[i] && isWhite(i)) (bg[i] = 1), (queue[tail++] = i);
  };
  for (let x = 0; x < W; x++) seed(x), seed((H - 1) * W + x);
  for (let y = 0; y < H; y++) seed(y * W), seed(y * W + W - 1);
  while (head < tail) {
    const i = queue[head++];
    const x = i % W;
    if (x > 0) seed(i - 1);
    if (x < W - 1) seed(i + 1);
    if (i >= W) seed(i - W);
    if (i < N - W) seed(i + W);
  }
  // Label foreground objects; keep the sizeable ones.
  const label = new Int32Array(N);
  const sizes = [0];
  for (let s = 0; s < N; s++) {
    if (bg[s] || label[s]) continue;
    const id = sizes.length;
    let size = 0;
    head = tail = 0;
    queue[tail++] = s;
    label[s] = id;
    while (head < tail) {
      const i = queue[head++];
      size++;
      const x = i % W;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
        if (j >= 0 && j < N && !bg[j] && !label[j]) (label[j] = id), (queue[tail++] = j);
      }
    }
    sizes.push(size);
  }
  const largest = Math.max(...sizes);
  const keep = sizes.map((s) => s >= largest * 0.03);
  const fg = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const x = i % W;
    const inside = x > 0 && x < W - 1 && i >= W && i < N - W;
    const k = (j) => keep[label[j]] && label[j] > 0;
    if (inside && k(i) && k(i - 1) && k(i + 1) && k(i - W) && k(i + W)) fg[i] = 255;
  }
  const alpha = await sharp(Buffer.from(fg), { raw: { width: W, height: H, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer();
  const rgba = Buffer.alloc(N * 4);
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < N; i++) {
    const a = alpha[i] / 255;
    const unmix = (c) => (a > 0.02 ? Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a))) : 0);
    for (let c = 0; c < 3; c++) rgba[i * 4 + c] = a < 1 ? unmix(rgb[i * 3 + c]) : rgb[i * 3 + c];
    rgba[i * 4 + 3] = alpha[i];
    if (alpha[i] > 8) {
      const x = i % W, y = (i / W) | 0;
      x0 = Math.min(x0, x), x1 = Math.max(x1, x), y0 = Math.min(y0, y), y1 = Math.max(y1, y);
    }
  }
  // A little air around the object.
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04);
  x0 = Math.max(0, x0 - pad), y0 = Math.max(0, y0 - pad), x1 = Math.min(W - 1, x1 + pad), y1 = Math.min(H - 1, y1 + pad);
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer();
}

const manifest = {};
for (const img of IMAGES) {
  const src = `photos/${img.name}.jpg`;
  const outDir = `public/products/${img.dir}`;
  mkdirSync(outDir, { recursive: true });
  // .rotate() applies the EXIF orientation (vape-a is a phone photo stored sideways).
  const base = sharp(src).rotate().resize({ width: img.max, height: img.max, fit: "inside", withoutEnlargement: true });
  const webp = await base.clone().webp({ quality: 82 }).toFile(`${outDir}/${img.name}.webp`);
  await base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(`${outDir}/${img.name}.jpg`);
  manifest[img.name] = { width: webp.width, height: webp.height };
  if (img.cutout) {
    const png = await cutout(src, img.cutout);
    const cut = sharp(png).resize({ width: img.max, height: img.max, fit: "inside", withoutEnlargement: true });
    const meta = await cut.clone().webp({ quality: 86, alphaQuality: 100 }).toFile(`${outDir}/${img.name}-cutout.webp`);
    await cut.clone().png({ compressionLevel: 9 }).toFile(`${outDir}/${img.name}-cutout.png`);
    manifest[`${img.name}-cutout`] = { width: meta.width, height: meta.height };
  }
  console.log(`${img.name}: ${webp.width}×${webp.height}${img.cutout ? " + cut-out" : ""}`);
}
writeFileSync("src/data/shop-image-sizes.json", JSON.stringify(manifest, null, 2) + "\n");
