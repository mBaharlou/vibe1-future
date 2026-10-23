// Rebuilds the "All keys" table in TRANSLATIONS.md from src/locales/{en,tr,fa}.json.
// Run: node scripts/translations-table.mjs
import fs from "node:fs";

const read = (lang) => JSON.parse(fs.readFileSync(new URL(`../src/locales/${lang}.json`, import.meta.url), "utf8"));
const [en, tr, fa] = ["en", "tr", "fa"].map(read);

const flat = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object" ? flat(value, `${prefix}${key}.`) : [[`${prefix}${key}`, String(value)]],
  );
const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj) ?? "";
const cell = (text) => String(text).replace(/\|/g, "\|").replace(/\n/g, " ");

const rows = flat(en).map(
  ([key, value]) => `| \`${key}\` | ${cell(value)} | ${cell(get(tr, key))} | <span dir="rtl">${cell(get(fa, key))}</span> |`,
);
const table = ["## All keys", "", "| Key | English | Türkçe | فارسی |", "| --- | --- | --- | --- |", ...rows, ""].join("\n");

const file = new URL("../TRANSLATIONS.md", import.meta.url);
const doc = fs.readFileSync(file, "utf8");
const start = doc.indexOf("## All keys");
if (start < 0) throw new Error('TRANSLATIONS.md has no "## All keys" section');
fs.writeFileSync(file, doc.slice(0, start) + table);
console.log(`${rows.length} keys written`);
