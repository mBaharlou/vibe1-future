import type { RefObject } from "react";
import { Link, useLocation } from "react-router";
import { OWNER } from "../config/home";
import { pages } from "../data/pages";
import { useLocale } from "../i18n";
import { BackToTop } from "./BackToTop";

/**
 * The footer of every sub-page: the mark and a line about the shop, the page links, how to reach
 * me, and "Back to top" (which then focuses `titleRef`). Colours come from the page theme.
 */
export function SiteFooter({ titleRef }: { titleRef: RefObject<HTMLElement | null> }) {
  const { t, upper, num } = useLocale();
  const { pathname } = useLocation();
  const year = new Date().getFullYear();
  const link =
    "footer-link inline-flex min-h-9 items-center rounded-md outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2";

  return (
    <footer
      data-cart-avoid=""
      className="glass relative z-10 border-t"
      style={{ background: "var(--t-surface)", borderColor: "var(--t-border)", color: "var(--t-text)" }}
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.6fr_1fr_1.2fr_auto] lg:gap-8">
        <div data-eyes-avoid="" className="sm:col-span-2 lg:col-span-1">
          <p className="footer-mark w-fit text-4xl font-black leading-none tracking-[-0.045em]">JOINT</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "var(--t-text-muted)" }}>
            {t("footer.tagline")}
          </p>
          <p
            className="mt-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] rtl:tracking-normal"
            style={{ borderColor: "var(--t-border)", color: "var(--t-text-muted)" }}
          >
            {t("shop.note")}
          </p>
        </div>

        <nav aria-labelledby="footer-pages" data-eyes-avoid="">
          <h2 id="footer-pages" className="footer-heading">
            {upper(t("footer.pages"))}
          </h2>
          <ul className="mt-3">
            <li>
              <Link to="/" className={link} style={{ outlineColor: "var(--t-accent)" }}>
                {t("footer.home")}
              </Link>
            </li>
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  to={page.path}
                  aria-current={pathname === page.path ? "page" : undefined}
                  className={link}
                  style={{ outlineColor: "var(--t-accent)" }}
                >
                  {t(`pages.${page.key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div data-eyes-avoid="">
          <h2 className="footer-heading">{upper(t("footer.contact"))}</h2>
          <ul className="mt-3">
            <li>
              <a href={`mailto:${OWNER.email}`} dir="ltr" className={link} style={{ outlineColor: "var(--t-accent)" }}>
                {OWNER.email}
              </a>
            </li>
            <li>
              <a href={OWNER.githubUrl} target="_blank" rel="noopener noreferrer" className={link} style={{ outlineColor: "var(--t-accent)" }}>
                <span dir="ltr">github.com/{OWNER.githubUser}</span>
                <span className="sr-only"> {t("common.newTab")}</span>
              </a>
            </li>
            <li className="flex min-h-9 items-center text-sm" style={{ color: "var(--t-text-muted)" }}>
              {t("footer.location")}
            </li>
          </ul>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
          <BackToTop titleRef={titleRef} />
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--t-border)" }}>
        <div
          data-eyes-avoid=""
          className="mx-auto flex max-w-[1400px] flex-col gap-1.5 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-10"
          style={{ color: "var(--t-text-muted)" }}
        >
          <p>{t("footer.rights", { year: num(year) })}</p>
          <p>{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
