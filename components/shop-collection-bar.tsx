import { Product } from "@/lib/store-data";
import {
  BOARD_SUBCATEGORIES,
  buildShopHref,
  getFantasySeriesList,
  getSeriesForProducts,
  getVisibleShopCollections,
  productMatchesCollection,
} from "@/lib/shop-filters";
import { BOARDS_UI_ENABLED } from "@/lib/feature-flags";
import Image from "next/image";
import Link from "next/link";

type ShopCollectionBarProps = {
  products: Product[];
  activeCollection?: string;
  activeSub?: string;
  activeSort?: string;
  collectionImages?: Record<string, string>;
};

export function ShopCollectionBar({
  products,
  activeCollection,
  activeSub,
  activeSort,
  collectionImages,
}: ShopCollectionBarProps) {
  const scoped = products.filter((product) =>
    productMatchesCollection(product, activeCollection),
  );

  const seriesList =
    activeCollection === "fantasy"
      ? getFantasySeriesList(scoped, collectionImages)
      : getSeriesForProducts(scoped);

  const allImage =
    seriesList.find((item) => item.image)?.image ||
    scoped.find((product) => product.image)?.image;

  const series =
    BOARDS_UI_ENABLED && activeCollection === "boards"
      ? BOARD_SUBCATEGORIES.map((item) => ({ ...item, image: undefined }))
      : [{ label: "All", key: "", image: allImage }, ...seriesList];

  const collections = getVisibleShopCollections();

  const showSeries = series.length > 1;

  return (
    <div className="shop-filter-bar">
      <p className="shop-filter-label">Collections</p>
      <div className="shop-filter-row" aria-label="Collections">
        {collections.map((item) => {
          const isActive = (activeCollection || "") === item.key;
          return (
            <Link
              key={item.key || "all"}
              href={buildShopHref({
                collection: item.key || undefined,
                sort: activeSort,
              })}
              className={`shop-filter-chip ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {showSeries ? (
        <div className="shop-filter-subs">
          <p className="shop-filter-label">
            {activeCollection === "fantasy" ? "Shop By Series" : "Series"}
          </p>
          {activeCollection === "fantasy" ? (
            <p className="shop-filter-series-copy">
              Find the fantasy you&apos;re looking for easily by the series it
              came out with!
            </p>
          ) : null}
          <div className="shop-series-grid" aria-label="Series">
            {series.map((item) => {
              const isActive = (activeSub || "") === item.key;
              return (
                <Link
                  key={item.key || "all-series"}
                  href={buildShopHref({
                    collection: activeCollection,
                    sub: item.key || undefined,
                    sort: activeSort,
                  })}
                  className={`shop-series-card ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="shop-series-media">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="48px"
                      />
                    ) : (
                      <span className="shop-series-fallback">
                        {item.label.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <strong>{item.label}</strong>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
