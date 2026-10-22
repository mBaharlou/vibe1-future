import type { ProductImage } from "../config/shop";

// The shop's products: 10 per page, each photo used in turn. Names, taglines and tags live in
// src/locales/*.json under shop.items.<id> and shop.tags.<tag>. Prices are in CURRENCY.

export type ProductCategory = "joints" | "vapes";
export type ProductTag = "new" | "bestseller" | "limited";

export type Product = {
  id: ProductId;
  category: ProductCategory;
  image: ProductImage;
  nameKey: `shop.items.${ProductId}.name`;
  taglineKey: `shop.items.${ProductId}.tagline`;
  price: number;
  tag?: ProductTag;
};

const JOINTS = [
  ["emerald-night", 24.9, "bestseller"],
  ["black-forest", 18.5, undefined],
  ["velvet-leaf", 29.9, "new"],
  ["jade-smoke", 21.0, undefined],
  ["midnight-mint", 16.9, undefined],
  ["green-comet", 34.5, "limited"],
  ["obsidian-haze", 27.4, undefined],
  ["moss-and-moon", 19.9, "new"],
  ["neon-sage", 22.8, undefined],
  ["silent-pine", 12.9, undefined],
] as const;

const VAPES = [
  ["cherry-pop", 19.9, "bestseller"],
  ["red-velvet", 44.9, undefined],
  ["ruby-cloud", 24.5, "new"],
  ["scarlet-mist", 39.9, undefined],
  ["cinnamon-kiss", 17.9, undefined],
  ["strawberry-haze", 49.9, "limited"],
  ["crimson-wave", 29.9, undefined],
  ["rose-quartz", 34.9, "new"],
  ["pomegranate-glow", 22.5, undefined],
  ["snow-and-ember", 46.5, undefined],
] as const;

export type ProductId = (typeof JOINTS)[number][0] | (typeof VAPES)[number][0];

const build = (category: ProductCategory, rows: readonly (readonly [ProductId, number, ProductTag | undefined])[], images: [ProductImage, ProductImage]) =>
  rows.map(
    ([id, price, tag], i): Product => ({
      id,
      category,
      image: images[i % 2],
      nameKey: `shop.items.${id}.name`,
      taglineKey: `shop.items.${id}.tagline`,
      price,
      ...(tag ? { tag } : {}),
    }),
  );

export const products: Product[] = [...build("joints", JOINTS, ["joint-a", "joint-b"]), ...build("vapes", VAPES, ["vape-a", "vape-b"])];

export const productsIn = (category: ProductCategory) => products.filter((p) => p.category === category);
export const productById = (id: string) => products.find((p) => p.id === id);
