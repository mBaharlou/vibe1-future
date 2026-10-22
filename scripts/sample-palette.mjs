// Dominant colours of a photo (k-means on a downscaled copy), to build a page theme from.
//
//   node scripts/sample-palette.mjs photos/products-hero.jpg [k]
//
// Prints each cluster as hex with its share of the image, darkest first.
import sharp from "sharp";

const [input, kArg = "6"] = process.argv.slice(2);
const K = Number(kArg);
const { data, info } = await sharp(input).rotate().resize(96, 96, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = [];
for (let i = 0; i < info.width * info.height; i++) px.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]);

// k-means++ seeding, then Lloyd iterations (deterministic: seeded random).
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const centers = [px[Math.floor(random() * px.length)]];
while (centers.length < K) {
  const dist = px.map((p) => Math.min(...centers.map((c) => d2(p, c))));
  let r = random() * dist.reduce((s, v) => s + v, 0);
  centers.push(px[dist.findIndex((v) => (r -= v) <= 0)]);
}
let assign = new Array(px.length).fill(0);
for (let it = 0; it < 30; it++) {
  assign = px.map((p) => centers.reduce((best, c, j) => (d2(p, c) < d2(p, centers[best]) ? j : best), 0));
  for (let j = 0; j < K; j++) {
    const mine = px.filter((_, i) => assign[i] === j);
    if (mine.length) centers[j] = [0, 1, 2].map((c) => mine.reduce((s, p) => s + p[c], 0) / mine.length);
  }
}
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
centers
  .map((c, j) => ({ c, share: assign.filter((a) => a === j).length / px.length }))
  .sort((a, b) => lum(a.c) - lum(b.c))
  .forEach(({ c, share }) => console.log(`${hex(c)}  ${(share * 100).toFixed(1).padStart(5)}%`));
