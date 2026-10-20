import { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { DENIM } from "../config/home";
import { pageTitle } from "../data/pages";
import { HomeButton, TopBar } from "./TopBar";

export function NotFound() {
  useEffect(() => {
    document.title = pageTitle("Not found");
  }, []);

  return (
    <>
      <TopBar left={<HomeButton />} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-svh flex-col items-center justify-center px-6 text-center"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #f4f4f4 0%, #f4f4f4 40%, #e9e9e9 100%)" }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.35em]" style={{ color: DENIM.base }}>
          Page not found
        </p>
        <h1 className="mt-2 font-black leading-[0.85] tracking-[-0.045em] text-ink" style={{ fontSize: "clamp(4rem, 22vw, 12rem)" }}>
          404
        </h1>
        <p className="mt-4 text-neutral-600">There's nothing at this address.</p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
          style={{ background: DENIM.base }}
        >
          ← Back to home
        </Link>
      </motion.main>
    </>
  );
}
