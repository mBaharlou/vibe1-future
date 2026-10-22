import { useEffect } from "react";
import { motion } from "framer-motion";
import type { PageData } from "../data/pages";
import { useLocale } from "../i18n";
import { SmokeReveal } from "./SmokeReveal";
import { TopBar } from "./TopBar";

/** Shared shell for /me and /contact. Text comes from src/locales/*.json. */
export function PageLayout({ page }: { page: PageData }) {
  const { t, upper } = useLocale();
  const title = t(`pages.${page.key}.title`);

  useEffect(() => {
    document.title = t("meta.pageTitle", { title });
  }, [t, title]);

  return (
    <>
      <TopBar home />
      <SmokeReveal />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-svh overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #f4f4f4 0%, #f4f4f4 40%, #e9e9e9 100%)" }}
      >
        <div
          className="relative mx-auto max-w-3xl px-6 pb-8 sm:px-10 sm:pb-14"
          style={{ paddingTop: "calc(var(--bar-h) + 84px)" }}
        >
          <h1
            data-eyes-avoid=""
            className="font-black leading-[0.85] tracking-[-0.045em] text-ink rtl:leading-[1.15] rtl:tracking-normal"
            style={{ fontSize: "clamp(3rem, 14vw, 9rem)" }}
          >
            {upper(title)}
          </h1>
          <p data-eyes-avoid="" className="mt-5 max-w-xl text-lg text-neutral-600">{t(`pages.${page.key}.description`)}</p>

          <div className="mt-10 max-w-2xl space-y-5 leading-relaxed text-neutral-700 rtl:leading-loose">
            <p data-eyes-avoid="">{t("page.body1")}</p>
            <p data-eyes-avoid="">{t("page.body2")}</p>
            <p data-eyes-avoid="">{t("page.body3")}</p>
          </div>
        </div>
      </motion.main>
    </>
  );
}
