// Web versions of the shop photos (photos/*.jpg, the originals) for /products and /vapes:
// .webp (q82) + .jpg fallback, cards ≤ 1000px and heroes ≤ 1600px on the long side. The joint
// photos are padded to 4:5 (the Products cards fill a 4:5 frame edge to edge).
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
  { name: "joint-a", dir: "joints", max: 1000, pad45: true },
  { name: "joint-b", dir: "joints", max: 1000, pad45: true },
  { name: "vapes-hero", dir: "vapes", max: 1600 },
  { name: "vape-a", dir: "vapes", max: 1000 },
  { name: "vape-b", dir: "vapes", max: 1000 },
];

// Pad a photo to 4:5 with its own background colour (sampled near the corner), so the Products
// cards can show it with object-fit: cover without cropping the product.
async function padTo45(input) {
  // Trim a few pixels first: the photo's outermost rows run lighter and would show as lines.
  const meta = await sharp(input).rotate().metadata();
  const trimmed = await sharp(input).rotate().extract({ left: 3, top: 3, width: meta.width - 6, height: meta.height - 6 }).toBuffer();
  const img = sharp(trimmed);
  const { width: w, height: h } = await img.metadata();
  // Average a patch a little inside the corner (the outermost JPEG pixels run lighter).
  const { data } = await sharp(trimmed).extract({ left: 4, top: 4, width: 12, height: 12 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const avg = (c) => Math.round(data.filter((_, i) => i % 3 === c).reduce((sum, v) => sum + v, 0) / (data.length / 3));
  const background = { r: avg(0), g: avg(1), b: avg(2) };
  const target = Math.round(w * 1.25);
  if (target <= h) return img.toBuffer();
  const top = Math.floor((target - h) / 2);
  return img.extend({ top, bottom: target - h - top, background }).toBuffer();
}

const manifest = {};
for (const img of IMAGES) {
  const src = `photos/${img.name}.jpg`;
  const outDir = `public/products/${img.dir}`;
  mkdirSync(outDir, { recursive: true });
  // .rotate() applies the EXIF orientation (vape-a is a phone photo stored sideways).
  const base = sharp(img.pad45 ? await padTo45(src) : src).rotate().resize({ width: img.max, height: img.max, fit: "inside", withoutEnlargement: true });
  const webp = await base.clone().webp({ quality: 82 }).toFile(`${outDir}/${img.name}.webp`);
  await base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(`${outDir}/${img.name}.jpg`);
  manifest[img.name] = { width: webp.width, height: webp.height };
  console.log(`${img.name}: ${webp.width}×${webp.height}${img.pad45 ? " (padded to 4:5)" : ""}`);
}
writeFileSync("src/data/shop-image-sizes.json", JSON.stringify(manifest, null, 2) + "\n");
