import { Navigate, Route, Routes, useLocation } from "react-router";
import { pages } from "./data/pages";
import { AskCat } from "./components/AskCat";
import { Eyes } from "./components/Eyes";
import { Hero } from "./components/Hero";
import { NotFound } from "./components/NotFound";
import { PageLayout } from "./components/PageLayout";
import { ScrollManager } from "./components/ScrollManager";

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollManager />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Hero />} />
        {pages.map((page) => (
          <Route key={page.id} path={page.path} element={<PageLayout page={page} />} />
        ))}
        {/* Old URLs: replace, so Back doesn't land on the redirect again. */}
        {pages.map((page) => (
          <Route key={page.legacyPath} path={page.legacyPath} element={<Navigate to={page.path} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Outside the routes, so the eyes and the chat carry on across in-tab navigation. */}
      <Eyes />
      <AskCat />
    </>
  );
}
