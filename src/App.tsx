import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { pages } from "./data/pages";
import { AskCat } from "./components/AskCat";
import { Eyes } from "./components/Eyes";
import { Hero } from "./components/Hero";
import { ScrollManager } from "./components/ScrollManager";
import { ThemeRoot } from "./components/ThemeRoot";
import { CartProvider } from "./lib/cart";

// Only home ships in the first bundle; the other pages load when they're opened.
const PageLayout = lazy(() => import("./components/PageLayout").then((m) => ({ default: m.PageLayout })));
const ShopPage = lazy(() => import("./components/shop/ShopPage").then((m) => ({ default: m.ShopPage })));
const NotFound = lazy(() => import("./components/NotFound").then((m) => ({ default: m.NotFound })));

export default function App() {
  const location = useLocation();

  return (
    <CartProvider>
      <ThemeRoot />
      <ScrollManager />
      <Suspense>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Hero />} />
        {pages.map((page) => (
          <Route
            key={page.id}
            path={page.path}
            element={page.shop ? <ShopPage page={page} category={page.shop} /> : <PageLayout page={page} />}
          />
        ))}
        {/* Old URLs: replace, so Back doesn't land on the redirect again. */}
        {pages.flatMap((page) =>
          page.legacyPaths.map((path) => <Route key={path} path={path} element={<Navigate to={page.path} replace />} />),
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      {/* Outside the routes, so the eyes and the chat carry on across in-tab navigation. */}
      <Eyes />
      <AskCat />
    </CartProvider>
  );
}
