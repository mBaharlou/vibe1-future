import { Route, Routes, useLocation } from "react-router";
import { pages } from "./data/pages";
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
