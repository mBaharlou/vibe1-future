import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OWNER } from "../config/home";
import type { PageData } from "../data/pages";
import { useLocale } from "../i18n";
import { Eyebrow, Icon, NIGHT_FILL, useLocalTime } from "./profile";
import { ContactForm } from "./shop/ContactForm";
import { SiteFooter } from "./SiteFooter";
import { SmokeReveal } from "./SmokeReveal";
import { TopBar } from "./TopBar";

const action =
  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2";
const actionStyle = { borderColor: "var(--t-border)", background: "var(--t-surface)", color: "var(--t-text)", outlineColor: "var(--t-accent)" };

/**
 * /contact: every way to reach me (email with a copy button, phone, GitHub, where I am and my
 * time right now) beside the message form (POST /api/contact).
 */
export function ContactPage({ page }: { page: PageData }) {
  const { t, upper } = useLocale();
  const reduce = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const time = useLocalTime();
  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0.3, delay } : { type: "spring" as const, bounce: 0, duration: 0.8, delay },
  });

  useEffect(() => {
    document.title = t("meta.pageTitle", { title: t(`pages.${page.key}.title`) });
  }, [t, page.key]);

  return (
    <>
      <TopBar home />
      <SmokeReveal />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-x-clip"
        style={{ color: "var(--t-text)" }}
      >
        <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:px-10" style={{ paddingTop: "calc(var(--bar-h) + 56px)" }}>
          <motion.div {...rise(0)}>
            <Eyebrow>{upper(t("contactPage.eyebrow"))}</Eyebrow>
            <h1
              ref={titleRef}
              tabIndex={-1}
              data-eyes-avoid=""
              className="title-fill mt-5 w-fit font-black leading-[0.86] tracking-[-0.045em] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-8 rtl:leading-[1.15] rtl:tracking-normal"
              style={{ fontSize: "clamp(3rem, 10vw, 7.5rem)", outlineColor: "var(--t-accent)", ...NIGHT_FILL }}
            >
              {upper(t("contactPage.headline"))}
            </h1>
            <p data-eyes-avoid="" className="mt-5 max-w-xl text-lg leading-relaxed rtl:leading-loose" style={{ color: "var(--t-text-muted)" }}>
              {t("contactPage.line")}
            </p>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-[1200px] items-start gap-6 px-5 pb-20 sm:px-10 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pb-28">
          <motion.ul {...rise(0.1)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Method icon="mail" label={t("contactPage.email")} value={<span dir="ltr">{OWNER.email}</span>}>
              <a href={`mailto:${OWNER.email}`} className={action} style={actionStyle}>
                <Icon name="mail" className="size-3.5" />
                {t("contactPage.email")}
              </a>
              <CopyButton text={OWNER.email} />
            </Method>
            <Method icon="phone" label={t("contactPage.phone")} value={<span dir="ltr">{OWNER.phoneDisplay}</span>}>
              <a href={`tel:${OWNER.phone}`} className={action} style={actionStyle}>
                <Icon name="phone" className="size-3.5" />
                {t("contactPage.call")}
              </a>
            </Method>
            <Method icon="github" label={t("contactPage.github")} value={<span dir="ltr">@{OWNER.githubUser}</span>}>
              <a href={OWNER.githubUrl} target="_blank" rel="noopener noreferrer" className={action} style={actionStyle}>
                {t("contactPage.githubAction")}
                <Icon name="arrow" className="size-3.5 rtl:-scale-x-100" />
                <span className="sr-only"> {t("common.newTab")}</span>
              </a>
            </Method>
            <Method icon="pin" label={t("contactPage.location")} value={t("footer.location")}>
              <p className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--t-text-muted)" }}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: "#22c55e" }} />
                {t("contactPage.localTime", { time })}
              </p>
            </Method>
            <li data-eyes-avoid="" className="list-none px-1 text-sm sm:col-span-2 lg:col-span-1" style={{ color: "var(--t-text-muted)" }}>
              {t("contactPage.languages")}
            </li>
          </motion.ul>

          <motion.div
            {...rise(0.2)}
            data-eyes-avoid=""
            className="glass relative rounded-[28px] border px-6 pb-7 pt-6 sm:px-9 sm:pb-9 sm:pt-8"
            style={{
              background: "var(--t-surface)",
              borderColor: "var(--t-border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 30px 60px -28px rgba(0,0,0,0.3), 0 40px 80px -40px var(--t-glow)",
            }}
          >
            <ContactForm />
          </motion.div>
        </section>
      </motion.main>
      <SiteFooter titleRef={titleRef} />
    </>
  );
}

function Method({ icon, label, value, children }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: ReactNode; children: ReactNode }) {
  return (
    <li
      data-eyes-avoid=""
      className="glass flex list-none items-start gap-4 rounded-[22px] border p-5"
      style={{ background: "var(--t-surface)", borderColor: "var(--t-border)" }}
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-2xl"
        style={{ background: "var(--t-accent)", color: "var(--t-on-accent)" }}
      >
        <Icon name={icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: "var(--t-text-muted)" }}>
          {label}
        </p>
        <p className="mt-0.5 break-words text-base font-extrabold">{value}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </li>
  );
}

/** Copies the email address; says "Copied!" for 2 s (and to screen readers). */
function CopyButton({ text }: { text: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the address is right there to select by hand.
    }
  };

  return (
    <button type="button" onClick={copy} aria-label={t("contactPage.copyLabel")} className={action} style={actionStyle}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-1.5"
        >
          <Icon name={copied ? "check" : "copy"} className="size-3.5" />
          {t(copied ? "contactPage.copied" : "contactPage.copy")}
        </motion.span>
      </AnimatePresence>
      <span aria-live="polite" className="sr-only">
        {copied ? t("contactPage.copied") : ""}
      </span>
    </button>
  );
}
