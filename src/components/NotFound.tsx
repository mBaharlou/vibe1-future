import { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { DENIM } from "../config/home";
import { useLocale } from "../i18n";
import { TopBar } from "./TopBar";

export function NotFound() {
  const { t, upper, num, dir } = useLocale();

  useEffect(() => {
    document.title = t("meta.pageTitle", { title: t("meta.notFoundTitle") });
  }, [t]);

  return (
    <>
      <TopBar home />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-svh flex-col items-center justify-center px-6 text-center"
        style={{
          paddingTop: "var(--bar-h)",
          background: "radial-gradient(ellipse at 50% 40%, #f4f4f4 0%, #f4f4f4 40%, #e9e9e9 100%)",
        }}
      >
        <p data-eyes-avoid="" className="bar-label" style={{ color: DENIM.base }}>
          {upper(t("notFound.label"))}
        </p>
        <h1 data-eyes-avoid="" className="mt-2 font-black leading-[0.85] tracking-[-0.045em] text-ink" style={{ fontSize: "clamp(4rem, 22vw, 12rem)" }}>
          {num(404)}
        </h1>
        <p data-eyes-avoid="" className="mt-4 text-neutral-600">{t("notFound.text")}</p>
        <Link
          to="/"
          data-eyes-avoid=""
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-white focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
          style={{ background: DENIM.base }}
        >
          <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {t("notFound.back")}
        </Link>
      </motion.main>
    </>
  );
}
