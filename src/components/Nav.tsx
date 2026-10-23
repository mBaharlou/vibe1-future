import { NavLink } from "react-router";
import { pages } from "../data/pages";
import { dirOf, useLocale } from "../i18n";

/**
 * The page links, always visible: in the bar's end column on wide screens, on their own row under
 * the bar on narrow ones (TopBar decides which). The current page keeps its underline.
 */
export function Nav({ className = "" }: { className?: string }) {
  const { t, lang } = useLocale();
  return (
    <nav aria-label={t("menu.navLabel")} className={className}>
      <ul className="flex items-center gap-1 sm:gap-2">
        {pages.map((page) => (
          <li key={page.id}>
            <NavLink
              to={page.path}
              className="menu-item flex h-9 items-center whitespace-nowrap rounded-full px-2 text-[12px] font-medium text-ink focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-ink sm:px-3 sm:text-[13px]"
            >
              <span lang={lang} dir={dirOf(lang)} className="menu-item-label relative">
                {t(`pages.${page.key}.title`)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
