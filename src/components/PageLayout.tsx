import { useEffect } from "react";
import { motion } from "framer-motion";
import { SHARD } from "../config/home";
import type { PageData } from "../data/pages";
import { useLocale } from "../i18n";
import { TopBar } from "./TopBar";

/** Shared shell for /page-1 … /page-4. Text comes from src/locales/*.json. */
export function PageLayout({ page }: { page: PageData }) {
  const { t, upper, num } = useLocale();
  const title = t(`pages.${page.key}.title`);

  useEffect(() => {
    document.title = t("meta.pageTitle", { title });
  }, [t, title]);

  return (
    <>
      <TopBar home />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-svh overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #f4f4f4 0%, #f4f4f4 40%, #e9e9e9 100%)" }}
      >
        <div aria-hidden="true" className="absolute inset-y-0 start-0 w-2 sm:w-3" style={{ background: page.color }} />
        <svg
          aria-hidden="true"
          viewBox={`0 0 100 ${100 * SHARD.aspect}`}
          className="absolute -end-10 w-[min(34vw,260px)] rotate-12"
          style={{ top: "calc(var(--bar-h) - 32px)" }}
        >
          <polygon points={SHARD.points} fill={page.color} />
        </svg>

        <div
          className="relative mx-auto max-w-3xl px-6 pb-8 sm:px-10 sm:pb-14"
          style={{ paddingTop: "calc(var(--bar-h) + 84px)" }}
        >
          <p className="bar-label" style={{ color: page.color }}>
            {upper(title)}
          </p>
          <h1
            className="mt-2 font-black leading-[0.85] tracking-[-0.045em] text-ink rtl:leading-[1.15] rtl:tracking-normal"
            style={{ fontSize: "clamp(3rem, 14vw, 9rem)" }}
          >
            {upper(t("page.heading", { n: num(page.id) }))}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-600">{t(`pages.${page.key}.description`)}</p>

          <div className="mt-10 max-w-2xl space-y-5 leading-relaxed text-neutral-700 rtl:leading-loose">
            <p>{t("page.body1")}</p>
            <p>{t("page.body2")}</p>
            <p>{t("page.body3")}</p>
          </div>
        </div>
      </motion.main>
    </>
  );
}
