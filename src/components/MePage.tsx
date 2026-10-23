import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { OWNER } from "../config/home";
import { LANGUAGE_COLORS, MARQUEE, PROJECTS, SKILL_GROUPS, STATS, STORY, STRONGEST_SKILL, type Skill } from "../data/me";
import type { PageData } from "../data/pages";
import { LANG_NAMES, LANGS, useLocale } from "../i18n";
import { DENIM_FILL, Eyebrow, Icon, useLocalTime } from "./profile";
import { SiteFooter } from "./SiteFooter";
import { SmokeReveal } from "./SmokeReveal";
import { TopBar } from "./TopBar";

/** Fade up into place when scrolled into view (just a fade with reduced motion). */
function useReveal(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: reduce ? { duration: 0.3, delay } : { type: "spring" as const, bounce: 0, duration: 0.8, delay },
  };
}

/** The same rise, on load: for the hero, which is always on screen first. */
function useEnter(delay = 0) {
  const { whileInView, viewport: _viewport, ...rest } = useReveal(delay);
  return { ...rest, animate: whileInView };
}

const button =
  "inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-2";

/**
 * /me: who I am, from my portfolio. A name-first hero with a profile card, a strip of the tools I
 * use, a few numbers, my story as a timeline, my skills, my GitHub projects and a call to talk.
 */
export function MePage({ page }: { page: PageData }) {
  const { t, upper } = useLocale();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hero = useEnter();
  const card = useEnter(0.15);

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
        <section
          className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:pb-24"
          style={{ paddingTop: "calc(var(--bar-h) + 56px)" }}
        >
          <motion.div {...hero}>
            <Eyebrow>{upper(t("me.eyebrow"))}</Eyebrow>
            <h1
              ref={titleRef}
              tabIndex={-1}
              data-eyes-avoid=""
              className="title-fill mt-5 w-fit font-black leading-[0.86] tracking-[-0.045em] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-8"
              style={{ fontSize: "clamp(2.8rem, 8.4vw, 6.4rem)", outlineColor: "var(--t-accent)", ...DENIM_FILL }}
            >
              {/* The name is never translated. */}
              <span dir="ltr" className="block">
                MOHAMMAD
              </span>
              <span dir="ltr" className="block">
                BAHARLOU
              </span>
            </h1>
            <p data-eyes-avoid="" className="mt-6 text-xl font-extrabold leading-snug" style={{ color: "var(--t-accent)" }}>
              {t("pages.me.description")}
            </p>
            <p data-eyes-avoid="" className="mt-3 max-w-xl text-base leading-relaxed rtl:leading-loose" style={{ color: "var(--t-text-muted)" }}>
              {t("me.intro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                data-eyes-avoid=""
                className={button}
                style={{ background: "var(--t-accent)", color: "var(--t-on-accent)", outlineColor: "var(--t-text)" }}
              >
                {t("me.ctaContact")}
                <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
              </Link>
              <a
                href={OWNER.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-eyes-avoid=""
                className={`${button} border`}
                style={{ borderColor: "var(--t-border)", background: "var(--t-surface)", color: "var(--t-text)", outlineColor: "var(--t-accent)" }}
              >
                <Icon name="github" className="size-4" />
                {t("me.ctaGithub")}
                <span className="sr-only"> {t("common.newTab")}</span>
              </a>
            </div>
          </motion.div>

          <motion.div {...card}>
            <ProfileCard />
          </motion.div>
        </section>

        <Marquee />
        <Stats />
        <Story />
        <Skills />
        <Work />
        <Cta />
      </motion.main>
      <SiteFooter titleRef={titleRef} />
    </>
  );
}

function ProfileCard() {
  const { t, lang } = useLocale();
  const reduce = useReducedMotion();
  const time = useLocalTime();
  const tag = lang === "fa" ? "fa-IR" : lang;
  // Noon UTC, so the day is the same in every time zone.
  const born = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${OWNER.born}T12:00:00Z`));

  const rows: [string, string, string?][] = [
    [t("me.card.based"), t("footer.location")],
    [t("me.card.born"), born],
    [t("me.card.works"), "Coalition Technologies", t("me.card.worksTeam")],
    [t("me.card.studies"), t("me.card.studiesValue"), t("me.card.studiesField")],
    [t("me.card.speaks"), LANGS.map((l) => LANG_NAMES[l]).join(" · ")],
  ];

  return (
    <div className={reduce ? "" : "me-card-float"}>
      <div
        data-eyes-avoid=""
        className="glass relative overflow-hidden rounded-[28px] border p-6 sm:p-7"
        style={{
          background: "var(--t-surface)",
          borderColor: "var(--t-border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 30px 60px -28px rgba(0,0,0,0.35), 0 40px 80px -40px var(--t-glow)",
        }}
      >
        {/* A soft accent light in the corner. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full opacity-50 blur-3xl"
          style={{ background: "var(--t-accent2)" }}
        />
        <div className="relative flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-black text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--t-accent) 0%, #6aa3c4 55%, var(--t-accent2) 100%)" }}
          >
            MB
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] rtl:tracking-normal" style={{ color: "var(--t-text-muted)" }}>
              {t("me.card.title")}
            </p>
            <p dir="ltr" className="truncate text-lg font-extrabold rtl:text-end">
              {OWNER.name}
            </p>
          </div>
        </div>

        <p className="relative mt-5 flex items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "var(--t-border)" }}>
          <span aria-hidden="true" className="relative flex size-2.5">
            {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "#22c55e" }} />}
            <span className="relative inline-flex size-2.5 rounded-full" style={{ background: "#22c55e" }} />
          </span>
          <span style={{ color: "var(--t-text-muted)" }}>{t("me.card.localTime")}</span>
          <span className="ms-auto font-bold tabular-nums">{time}</span>
        </p>

        <dl className="relative mt-4 divide-y" style={{ borderColor: "var(--t-border)" }}>
          {rows.map(([label, value, sub]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-3" style={{ borderColor: "var(--t-border)" }}>
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] rtl:tracking-normal" style={{ color: "var(--t-text-muted)" }}>
                {label}
              </dt>
              <dd className="text-end text-sm font-bold">
                {value}
                {sub && (
                  <span className="block text-xs font-medium" style={{ color: "var(--t-text-muted)" }}>
                    {sub}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** The tools I use, sliding by. Decorative: the same names are listed under Skills. */
function Marquee() {
  const words = [...MARQUEE, ...MARQUEE];
  return (
    <div aria-hidden="true" dir="ltr" className="marquee relative overflow-hidden border-y py-5" style={{ borderColor: "var(--t-border)", background: "var(--t-surface)" }}>
      <div className="marquee-track gap-10 pe-10">
        {words.map((word, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap text-2xl font-black tracking-[-0.02em] sm:text-3xl">
            <span style={{ color: i % 3 === 0 ? "var(--t-accent)" : "var(--t-text)" }}>{word}</span>
            <span className="text-base" style={{ color: "var(--t-accent2)" }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const { t, num } = useLocale();
  const stats = [
    { value: `${num(STATS.years)}+`, label: t("me.stats.years") },
    { value: num(STATS.languages), label: t("me.stats.languages") },
    { value: num(STATS.repos), label: t("me.stats.repos") },
    { value: STRONGEST_SKILL, label: t("me.stats.strongest") },
  ];
  return (
    <section className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-5 py-16 sm:px-10 lg:grid-cols-4 lg:py-20">
      {stats.map((stat, i) => (
        <Stat key={stat.label} delay={i * 0.08} {...stat} />
      ))}
    </section>
  );
}

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const reveal = useReveal(delay);
  return (
    <motion.div
      {...reveal}
      data-eyes-avoid=""
      className="glass rounded-[22px] border p-5 sm:p-6"
      style={{ background: "var(--t-surface)", borderColor: "var(--t-border)" }}
    >
      {/* A word like "JavaScript" gets a smaller size than a number so it stays inside the tile. */}
      <p
        dir="auto"
        className="footer-mark w-fit max-w-full break-words font-black leading-none tracking-[-0.04em]"
        style={{ fontSize: value.length > 4 ? "clamp(1.25rem, 2.3vw, 2rem)" : "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.1 }}
      >
        {value}
      </p>
      <p className="mt-2 text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>
        {label}
      </p>
    </motion.div>
  );
}

function SectionTitle({ title, line }: { title: string; line?: string }) {
  const { upper } = useLocale();
  const reveal = useReveal();
  return (
    <motion.div {...reveal} data-eyes-avoid="" className="mb-10">
      <h2 className="font-black leading-none tracking-[-0.04em] rtl:leading-tight rtl:tracking-normal" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>
        {upper(title)}
      </h2>
      {line && (
        <p className="mt-3 max-w-xl text-base" style={{ color: "var(--t-text-muted)" }}>
          {line}
        </p>
      )}
    </motion.div>
  );
}

function Story() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10 lg:py-20">
      <SectionTitle title={t("me.story.title")} />
      <ol className="relative grid gap-5 border-s-2 ps-6 sm:ps-10 md:grid-cols-2 md:gap-x-8 md:border-s-0 md:ps-0" style={{ borderColor: "var(--t-border)" }}>
        {STORY.map((key, i) => (
          <StoryItem key={key} index={i} title={t(`me.story.${key}.title`)} text={t(`me.story.${key}.text`)} />
        ))}
      </ol>
    </section>
  );
}

function StoryItem({ index, title, text }: { index: number; title: string; text: string }) {
  const { num } = useLocale();
  const reveal = useReveal((index % 2) * 0.1);
  return (
    <motion.li {...reveal} className="relative list-none">
      {/* The dot on the timeline (phones); from md the cards sit in a two-column grid. */}
      <span
        aria-hidden="true"
        className="absolute -start-[33px] top-7 size-4 rounded-full border-4 sm:-start-[49px] md:hidden"
        style={{ background: "var(--t-accent)", borderColor: "var(--t-bg)" }}
      />
      <article
        data-eyes-avoid=""
        className="glass group h-full rounded-[22px] border p-6 transition-transform duration-300 hover:-translate-y-1"
        style={{ background: "var(--t-surface)", borderColor: "var(--t-border)" }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-black"
            style={{ background: "var(--t-accent)", color: "var(--t-on-accent)" }}
          >
            {num(index + 1)}
          </span>
          <h3 className="text-lg font-extrabold">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed rtl:leading-loose" style={{ color: "var(--t-text-muted)" }}>
          {text}
        </p>
      </article>
    </motion.li>
  );
}

function Skills() {
  const { t } = useLocale();
  const nameOf = (skill: Skill) => ("label" in skill ? skill.label : t(`me.skills.names.${skill.nameKey}`));
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10 lg:py-20">
      <SectionTitle title={t("me.skills.title")} line={t("me.skills.line")} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((group, i) => (
          <SkillCard key={group.key} delay={(i % 3) * 0.08} title={t(`me.skills.groups.${group.key}`)} names={group.skills.map(nameOf)} />
        ))}
      </div>
    </section>
  );
}

function SkillCard({ title, names, delay }: { title: string; names: string[]; delay: number }) {
  const { t } = useLocale();
  const reveal = useReveal(delay);
  return (
    <motion.article
      {...reveal}
      data-eyes-avoid=""
      className="glass rounded-[22px] border p-6"
      style={{ background: "var(--t-surface)", borderColor: "var(--t-border)" }}
    >
      <h3 className="text-lg font-extrabold">{title}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {names.map((name) => {
          const strongest = name === STRONGEST_SKILL;
          return (
            <li
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold"
              style={
                strongest
                  ? { background: "var(--t-accent2)", color: "var(--t-on-accent2)", borderColor: "transparent" }
                  : { borderColor: "var(--t-border)", background: "var(--t-surface)" }
              }
            >
              {name}
              {strongest && (
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-80 rtl:tracking-normal">★ {t("me.skills.strongest")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </motion.article>
  );
}

function Work() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10 lg:py-20">
      <SectionTitle title={t("me.work.title")} line={t("me.work.line")} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.name} project={project} delay={(i % 3) * 0.08} />
        ))}
      </ul>
    </section>
  );
}

function ProjectCard({ project, delay }: { project: (typeof PROJECTS)[number]; delay: number }) {
  const { t, num } = useLocale();
  const reveal = useReveal(delay);
  return (
    <motion.li {...reveal} className="list-none">
      <a
        href={`${OWNER.githubUrl}/${project.name}`}
        target="_blank"
        rel="noopener noreferrer"
        data-eyes-avoid=""
        className="project-card glass group flex h-full flex-col rounded-[22px] border p-6 outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-[3px] focus-visible:outline-offset-2"
        style={{ background: "var(--t-surface)", borderColor: "var(--t-border)", outlineColor: "var(--t-accent)" }}
      >
        <div className="flex items-center justify-between gap-3 text-xs font-semibold" style={{ color: "var(--t-text-muted)" }}>
          <span className="inline-flex items-center gap-2" dir="ltr">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[project.language] }} />
            {project.language}
          </span>
          <span className="tabular-nums">{num(project.year)}</span>
        </div>
        <h3 dir="ltr" className="mt-4 text-lg font-extrabold rtl:text-end">
          {project.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed rtl:leading-loose" style={{ color: "var(--t-text-muted)" }}>
          {t(`me.work.items.${project.name}`)}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--t-accent)" }}>
          <Icon name="github" className="size-4" />
          {t("me.work.view")}
          <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </span>
        <span className="sr-only"> {t("common.newTab")}</span>
      </a>
    </motion.li>
  );
}

function Cta() {
  const { t, upper } = useLocale();
  const reveal = useReveal();
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-20 pt-8 sm:px-10 lg:pb-28">
      <motion.div
        {...reveal}
        data-eyes-avoid=""
        className="relative overflow-hidden rounded-[32px] px-6 py-14 text-center sm:px-12 sm:py-20"
        style={{ background: "linear-gradient(135deg, #1d4560 0%, var(--t-accent) 50%, #4f8db0 100%)", color: "#ffffff" }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full opacity-40 blur-3xl" style={{ background: "var(--t-accent2)" }} />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -end-16 size-80 rounded-full opacity-30 blur-3xl" style={{ background: "#a5f3fc" }} />
        <h2 className="relative font-black leading-none tracking-[-0.04em] rtl:leading-tight rtl:tracking-normal" style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)" }}>
          {upper(t("me.cta.title"))}
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-base text-white/85">{t("me.cta.line")}</p>
        <Link
          to="/contact"
          className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{ color: "var(--t-accent)" }}
        >
          {t("me.cta.button")}
          <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
