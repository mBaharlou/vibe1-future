// What the Me page says about me (from my portfolio, github.com/mBaharlou/my-portfolio).
// Every sentence lives in src/locales/*.json under me.*; this file holds the structure, the
// skill names that stay in English, and the projects.

export type SkillNameKey = "uiDesign" | "layouts" | "components" | "responsive" | "native";
/** A skill is either a proper name shown as is (React) or a key under me.skills.names. */
export type Skill = { label: string } | { nameKey: SkillNameKey };

export type SkillGroupKey = "frontend" | "design" | "tools" | "mobile" | "animation";

export const SKILL_GROUPS: { key: SkillGroupKey; skills: Skill[] }[] = [
  {
    key: "frontend",
    skills: [
      { label: "HTML" },
      { label: "CSS" },
      { label: "JavaScript" },
      { label: "React" },
      { label: "Redux" },
      { label: "TypeScript" },
      { label: "Next.js" },
      { label: "Tailwind CSS" },
    ],
  },
  { key: "design", skills: [{ nameKey: "uiDesign" }, { label: "Figma" }, { nameKey: "layouts" }] },
  { key: "tools", skills: [{ label: "Git" }, { nameKey: "components" }, { nameKey: "responsive" }] },
  { key: "mobile", skills: [{ label: "Flutter" }, { nameKey: "native" }] },
  { key: "animation", skills: [{ label: "Framer Motion" }] },
];

export const STRONGEST_SKILL = "JavaScript";

/** The strip that slides across the page. */
export const MARQUEE = ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Framer Motion", "Next.js", "Redux", "Figma", "HTML", "CSS", "Git", "Flutter"];

export const STATS = { years: 5, languages: 3, repos: 9 };

/** The story, in order: me.story.<key>.title / .text. */
export const STORY = ["who", "journey", "education", "work", "home", "languages"] as const;

export type RepoName = "vibe1-future" | "my-portfolio" | "my-weather-calc-app" | "shop-react-web" | "bhCrypto-web" | "crypto-app";

/** Public GitHub repos, newest first. Language and year as GitHub shows them. */
export const PROJECTS: { name: RepoName; language: "TypeScript" | "JavaScript" | "CSS"; year: number }[] = [
  { name: "vibe1-future", language: "TypeScript", year: 2026 },
  { name: "my-portfolio", language: "JavaScript", year: 2026 },
  { name: "my-weather-calc-app", language: "TypeScript", year: 2026 },
  { name: "shop-react-web", language: "CSS", year: 2026 },
  { name: "bhCrypto-web", language: "JavaScript", year: 2026 },
  { name: "crypto-app", language: "JavaScript", year: 2024 },
];

/** GitHub's own language colours. */
export const LANGUAGE_COLORS = { TypeScript: "#3178c6", JavaScript: "#f1e05a", CSS: "#663399" } as const;
