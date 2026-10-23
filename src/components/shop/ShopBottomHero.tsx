import { CAT } from "../../config/home";
import { SHOP, SHOP_HEROES } from "../../config/shop";
import type { ProductCategory } from "../../data/products";
import { useLocale } from "../../i18n";
import { Cat } from "../Cat";

const heroCss = `:root{--shop-hero-h:${SHOP.heroHeightMobile}}@media (min-width:768px){:root{--shop-hero-h:${SHOP.heroHeight}}}`;

/**
 * The end of a shop page, right under the products: the page's cat in the home cat's arch frame,
 * standing on the footer.
 */
export function ShopBottomHero({ category }: { category: ProductCategory }) {
  const { t } = useLocale();

  return (
    <div className="relative mt-10 flex w-full justify-center sm:mt-14">
      <style>{heroCss}</style>
      <div data-cart-avoid="" className="relative" style={{ height: "var(--shop-hero-h)", aspectRatio: CAT.aspect }}>
        <Cat placement={{ height: 100, bottom: 0 }} photo={SHOP_HEROES[category]} alt={t(`shop.heroAlt.${category}`)} />
      </div>
    </div>
  );
}
