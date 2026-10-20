import { Navigate, Route, Routes, useLocation } from "react-router";
import { pages } from "./data/pages";
import { Hero } from "./components/Hero";
import { PageLayout } from "./components/PageLayout";
import { ShardTransitionProvider } from "./components/ShardTransition";

export default function App() {
  const location = useLocation();

  return (
    <ShardTransitionProvider>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Hero />} />
        {pages.map((page) => (
          <Route key={page.id} path={page.path} element={<PageLayout page={page} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ShardTransitionProvider>
  );
}
