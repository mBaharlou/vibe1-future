import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next, useTranslation } from "react-i18next";
import { LANG_SWITCH } from "./config/home";
import { CURRENCY } from "./config/shop";
import en from "./locales/en.json";
import fa from "./locales/fa.json";
import tr from "./locales/tr.json";

// en.json is the source of truth: tr/fa must have every key (compile error otherwise),
// and t() only accepts keys that exist in it (see CustomTypeOptions below).
export const resources = {
  en: { translation: en },
  tr: { translation: tr satisfies typeof en },
  fa: { translation: fa satisfies typeof en },
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
  }
}

export type Lang = keyof typeof resources;
export const LANGS: Lang[] = ["en", "tr", "fa"];
/** Native names; never translated. */
export const LANG_NAMES: Record<Lang, string> = { en: "English", tr: "Türkçe", fa: "فارسی" };
/** Same key as the inline script in index.html, which sets <html lang/dir> before React mounts. */
export const STORAGE_KEY = "lang";

export const dirOf = (lang: Lang) => (lang === "fa" ? "rtl" : "ltr");
const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);
const current = (): Lang => (isLang(i18n.resolvedLanguage) ? i18n.resolvedLanguage : "en");

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: LANGS,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    // Caching is done below with the normalised code ("tr", not "tr-TR"), which the inline
    // script in index.html and the other tabs expect.
    detection: { order: ["localStorage", "navigator"], lookupLocalStorage: STORAGE_KEY, caches: [] },
  });

const applyDocument = (lang: Lang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = dirOf(lang);
  try {
    if (localStorage.getItem(STORAGE_KEY) !== lang) localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage blocked: the language still applies to this tab.
  }
};
applyDocument(current());
i18n.on("languageChanged", () => applyDocument(current()));

// Pages live in separate tabs: a change in one tab updates the others live.
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY && isLang(e.newValue) && e.newValue !== current()) void switchLanguage(e.newValue);
});

/** Switch language. A change of direction crossfades the page instead of jumping to the mirrored layout. */
export async function switchLanguage(lang: Lang) {
  if (lang === current()) return;
  const root = document.getElementById("root");
  const flips = dirOf(lang) !== dirOf(current());
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const half = LANG_SWITCH.dirFadeMs / 2;
  if (root && flips && !reduce) await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: half, easing: "ease-in" }).finished;
  await i18n.changeLanguage(lang);
  if (root && flips && !reduce) root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: half, easing: "ease-out" });
}

/** Current language plus locale helpers: uppercase (Turkish i → İ), native digits and prices. */
export function useLocale() {
  const { t, i18n: instance } = useTranslation();
  const lang: Lang = isLang(instance.resolvedLanguage) ? instance.resolvedLanguage : "en";
  const tag = lang === "fa" ? "fa-IR" : lang;
  const numbers = new Intl.NumberFormat(tag, { useGrouping: false });
  const money = new Intl.NumberFormat(tag, { style: "currency", currency: CURRENCY });
  return {
    t,
    lang,
    dir: dirOf(lang),
    upper: (text: string) => text.toLocaleUpperCase(lang),
    num: (n: number) => numbers.format(n),
    price: (n: number) => money.format(n),
  };
}

export default i18n;
