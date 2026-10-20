// Cuts the joint out of photos/joint1.jpg (a joint on a white background) and saves a tight,
// horizontal, transparent copy: filter on the left, twisted tip on the right.
//
//   node scripts/cutout-joint.mjs [input] [outputBase]
//   defaults: photos/joint1.jpg → public/photo/joint-cutout.webp + .png
//
// How: flood-fill near-white from the image edges (so light areas inside the joint, like the
// cream filter, are never removed), keep the largest object, erode 1px and feather the edge,
// then remove the white that is mixed into the soft edge pixels so there is no halo.
// The joint's main axis (PCA) gives the rotation.
import sharp from "sharp";

const input = process.argv[2] ?? "photos/joint1.jpg";
const outBase = process.argv[3] ?? "public/photo/joint-cutout";

// Near-white = bright and nearly grey. JPEG noise in the background stays well inside this.
const WHITE_MIN = 226;
const WHITE_MAX_SAT = 24;
const FEATHER_SIGMA = 0.7;
const PAD = 2;

const { data: rgb, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;
const at = (i) => [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]];
const isWhite = (i) => {
  const [r, g, b] = at(i);
  const lo = Math.min(r, g, b);
  return lo >= WHITE_MIN && Math.max(r, g, b) - lo <= WHITE_MAX_SAT;
};

// 1. Background: near-white pixels connected to the border.
const bg = new Uint8Array(N);
const queue = new Int32Array(N);
let head = 0;
let tail = 0;
const seed = (i) => {
  if (!bg[i] && isWhite(i)) {
    bg[i] = 1;
    queue[tail++] = i;
  }
};
for (let x = 0; x < W; x++) {
  seed(x);
  seed((H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  seed(y * W);
  seed(y * W + W - 1);
}
while (head < tail) {
  const i = queue[head++];
  const x = i % W;
  if (x > 0) seed(i - 1);
  if (x < W - 1) seed(i + 1);
  if (i >= W) seed(i - W);
  if (i < N - W) seed(i + W);
}

// 2. Keep the largest foreground object only (drops JPEG specks).
const label = new Int32Array(N);
let best = 0;
let bestSize = 0;
let next = 0;
for (let s = 0; s < N; s++) {
  if (bg[s] || label[s]) continue;
  next++;
  let size = 0;
  head = tail = 0;
  queue[tail++] = s;
  label[s] = next;
  while (head < tail) {
    const i = queue[head++];
    size++;
    const x = i % W;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
      if (j >= 0 && j < N && !bg[j] && !label[j]) {
        label[j] = next;
        queue[tail++] = j;
      }
    }
  }
  if (size > bestSize) {
    bestSize = size;
    best = next;
  }
}

// 3. Erode 1px (JPEG bleeds white into the outermost pixels), then feather.
const fg = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  if (label[i] !== best) continue;
  const x = i % W;
  const inside = x > 0 && x < W - 1 && i >= W && i < N - W;
  if (inside && label[i - 1] === best && label[i + 1] === best && label[i - W] === best && label[i + W] === best) fg[i] = 255;
}
const alpha = await sharp(Buffer.from(fg), { raw: { width: W, height: H, channels: 1 } })
  .blur(FEATHER_SIGMA)
  .extractChannel(0)
  .raw()
  .toBuffer();

// 4. Un-mix white from soft edge pixels: observed = a·colour + (1 − a)·white.
const rgba = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const a = alpha[i] / 255;
  const [r, g, b] = at(i);
  const unmix = (c) => (a > 0.02 ? Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a))) : 0);
  rgba[i * 4] = a < 1 ? unmix(r) : r;
  rgba[i * 4 + 1] = a < 1 ? unmix(g) : g;
  rgba[i * 4 + 2] = a < 1 ? unmix(b) : b;
  rgba[i * 4 + 3] = alpha[i];
}

// 5. Main axis of the joint → rotate it horizontal.
let sx = 0, sy = 0, n = 0;
for (let i = 0; i < N; i++) if (fg[i]) { sx += i % W; sy += (i / W) | 0; n++; }
const mx = sx / n, my = sy / n;
let cxx = 0, cyy = 0, cxy = 0;
for (let i = 0; i < N; i++) {
  if (!fg[i]) continue;
  const dx = (i % W) - mx, dy = ((i / W) | 0) - my;
  cxx += dx * dx; cyy += dy * dy; cxy += dx * dy;
}
const angle = (0.5 * Math.atan2(2 * cxy, cxx - cyy) * 180) / Math.PI; // screen coords, y down
const rotated = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .rotate(-angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .raw()
  .toBuffer({ resolveWithObject: true });

// 6. Tight crop, then put the filter (the lighter, cream end) on the left.
const R = rotated.data, RW = rotated.info.width, RH = rotated.info.height;
let x0 = RW, y0 = RH, x1 = 0, y1 = 0;
for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
  if (R[(y * RW + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
}
x0 = Math.max(0, x0 - PAD); y0 = Math.max(0, y0 - PAD);
x1 = Math.min(RW - 1, x1 + PAD); y1 = Math.min(RH - 1, y1 + PAD);
const brightness = (from, to) => {
  let sum = 0, count = 0;
  for (let y = y0; y <= y1; y++) for (let x = from; x <= to; x++) {
    const k = (y * RW + x) * 4;
    if (R[k + 3] > 200) { sum += R[k] + R[k + 1] + R[k + 2]; count++; }
  }
  return count ? sum / count : 0;
};
const span = x1 - x0;
const leftLight = brightness(x0, x0 + Math.round(span * 0.15));
const rightLight = brightness(x1 - Math.round(span * 0.15), x1);
const filterOnRight = rightLight > leftLight;

let out = sharp(R, { raw: { width: RW, height: RH, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 });
if (filterOnRight) out = sharp(await out.flop().png().toBuffer());
const png = await out.png({ compressionLevel: 9 }).toBuffer();
await sharp(png).toFile(`${outBase}.png`);
await sharp(png).webp({ quality: 92, alphaQuality: 100 }).toFile(`${outBase}.webp`);

const meta = await sharp(png).metadata();
console.log(`joint cut out: ${meta.width}×${meta.height}, rotated ${(-angle).toFixed(1)}°, filter on the left, tip on the right`);
console.log(`→ ${outBase}.webp, ${outBase}.png`);
