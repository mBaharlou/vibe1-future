import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { SHARD } from "../config/home";
import { pageTitle, type PageData } from "../data/pages";

const lorem = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.",
  "Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.",
  "Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.",
];

/** Shared shell for /page-1 … /page-4. Real content comes from src/data/pages.ts later. */
export function PageLayout({ page }: { page: PageData }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = pageTitle(page.title);
  }, [page]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative min-h-svh overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #f4f4f4 0%, #f4f4f4 40%, #e9e9e9 100%)" }}
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 sm:w-3" style={{ background: page.color }} />
      <svg
        aria-hidden="true"
        viewBox={`0 0 100 ${100 * SHARD.aspect}`}
        className="absolute -right-10 -top-8 w-[min(34vw,260px)] rotate-12"
      >
        <polygon points={SHARD.points} fill={page.color} />
      </svg>

      <div className="relative mx-auto max-w-3xl px-6 py-8 sm:px-10 sm:py-14">
        <Link
          to="/"
          onClick={(e) => {
            // Go back through real history when we arrived from inside the app; otherwise to home.
            if ((window.history.state?.idx ?? 0) > 0) {
              e.preventDefault();
              navigate(-1);
            }
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-neutral-600 hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          ← Back
        </Link>

        <p className="mt-12 text-xs font-medium uppercase tracking-[0.35em]" style={{ color: page.color }}>
          {page.title}
        </p>
        <h1
          className="mt-2 font-black leading-[0.85] tracking-[-0.045em] text-ink"
          style={{ fontSize: "clamp(3rem, 14vw, 9rem)" }}
        >
          PAGE {page.id}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-neutral-600">{page.description}</p>

        <div className="mt-10 max-w-2xl space-y-5 leading-relaxed text-neutral-700">
          {lorem.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>
    </motion.main>
  );
}
