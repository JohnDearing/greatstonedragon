import { ShopBoardCard } from "@/components/shop-board-card";
import { ShopCollectionBar } from "@/components/shop-collection-bar";
import { ShopProductCard } from "@/components/shop-product-card";
import { ShopSortBar } from "@/components/shop-sort-bar";
import { hydrateBoardsFromCatalog } from "@/lib/board-catalog";
import { buildPriceBoardsFromCatalog } from "@/lib/price-board-catalog";
import {
  collectionLabel,
  isInternationalPreorderProduct,
  parseShopSort,
  productMatchesCollection,
  productMatchesSeries,
  seriesLabel,
  sortCatalogProducts,
} from "@/lib/shop-filters";
import { BOARDS_UI_ENABLED } from "@/lib/feature-flags";
import { Product } from "@/lib/store-data";

type ProductsShopSectionProps = {
  products: Product[];
  activeCollection?: string;
  activeSub?: string;
  activeSort?: string;
  quickSlug?: string;
  collectionImages?: Record<string, string>;
};

type ProductSection = {
  title: string;
  key: string;
  items: Product[];
};

const SECTION_RULES: {
  title: string;
  key: string;
  match: (product: Product) => boolean;
}[] = [
  {
    title: "New Release",
    key: "new-releases",
    match: (product) =>
      product.collection === "new-releases" || product.badge === "New",
  },
  {
    title: "Fantasy Pins",
    key: "fantasy",
    match: (product) => product.collection === "fantasy",
  },
  {
    title: "International Preorders",
    key: "international-preorder",
    match: (product) => isInternationalPreorderProduct(product),
  },
  {
    title: "Stickers",
    key: "stickers",
    match: (product) => product.category === "stickers",
  },
  {
    title: "Trading Accessories",
    key: "accessories",
    match: (product) =>
      product.category === "accessories" ||
      /popper|clutch|remover|accessor|trading/i.test(
        `${product.name} ${product.shortDescription}`,
      ),
  },
  {
    title: "Pins",
    key: "pins",
    match: (product) => product.category === "pins",
  },
];

function groupProductsByCategory(products: Product[]): ProductSection[] {
  const used = new Set<string>();
  const sections: ProductSection[] = [];

  for (const rule of SECTION_RULES) {
    const items = products.filter(
      (product) => !used.has(product.id) && rule.match(product),
    );
    if (!items.length) continue;
    items.forEach((product) => used.add(product.id));
    sections.push({
      title: rule.title,
      key: rule.key,
      items,
    });
  }

  const leftover = products.filter((product) => !used.has(product.id));
  if (leftover.length) {
    sections.push({
      title: "More Products",
      key: "more",
      items: leftover,
    });
  }

  return sections;
}

function PriceBoardsGrid({ products }: { products: Product[] }) {
  const boards = buildPriceBoardsFromCatalog(products).filter(
    (board) => board.items.length,
  );

  if (!boards.length) return null;

  return (
    <div className="products-shop-block">
      <div className="products-shop-block-head">
        <h2>Price Boards</h2>
        <span className="products-shop-count">
          {boards.length} {boards.length === 1 ? "board" : "boards"}
        </span>
      </div>
      <div className="products-shop-grid">
        {boards.map((board) => (
          <ShopBoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  );
}

function BoardsGrid({
  title = "Boards",
  products,
}: {
  title?: string;
  products: Product[];
}) {
  const boards = hydrateBoardsFromCatalog(products);
  const boardsWithItems = boards.filter((board) => board.items.some((item) => item.variantId));
  return (
    <div className="products-shop-block">
      <div className="products-shop-block-head">
        <h2>{title}</h2>
        <span className="products-shop-count">
          {boardsWithItems.length}{" "}
          {boardsWithItems.length === 1 ? "board" : "boards"}
        </span>
      </div>
      <div className="products-shop-grid">
        {boardsWithItems.map((board) => (
          <ShopBoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  );
}

export function ProductsShopSection({
  products,
  activeCollection,
  activeSub,
  activeSort,
  collectionImages,
}: ProductsShopSectionProps) {
  const sort = parseShopSort(activeSort);
  const effectiveCollection =
    !BOARDS_UI_ENABLED && activeCollection === "boards"
      ? undefined
      : activeCollection;
  const effectiveSub =
    !BOARDS_UI_ENABLED &&
    (activeSub === "price-boards" || activeSub === "category-boards")
      ? undefined
      : activeSub;

  const isBoardsCollection =
    BOARDS_UI_ENABLED && effectiveCollection === "boards";
  const showPriceBoards =
    BOARDS_UI_ENABLED &&
    isBoardsCollection &&
    (!activeSub || activeSub === "price-boards");
  const showCategoryBoards =
    BOARDS_UI_ENABLED &&
    isBoardsCollection &&
    (!activeSub || activeSub === "category-boards");

  const scopedProducts = products.filter((product) =>
    productMatchesCollection(product, effectiveCollection),
  );
  const seriesFiltered = sortCatalogProducts(
    scopedProducts.filter((product) =>
      productMatchesSeries(product, effectiveSub),
    ),
    sort,
  );

  const groupedSections = groupProductsByCategory(seriesFiltered);
  const heading = [
    collectionLabel(effectiveCollection),
    seriesLabel(products, effectiveSub, effectiveCollection),
  ]
    .filter(Boolean)
    .join(" · ");

  const visibleSections = isBoardsCollection
    ? []
    : effectiveCollection || effectiveSub
      ? [
          {
            title: heading,
            key: effectiveSub || effectiveCollection || "filtered",
            items: seriesFiltered,
          },
        ]
      : groupedSections.filter(
          (section) => section.key !== "stickers" && section.key !== "accessories",
        );

  const showBoards =
    BOARDS_UI_ENABLED &&
    !effectiveSub &&
    (isBoardsCollection ||
      !effectiveCollection ||
      effectiveCollection === "all-products");

  return (
    <section className="products-shop">
      <div className="container">
        <div className="products-shop-top">
          <h1>Shop For What You&apos;re Looking For</h1>
          <ShopCollectionBar
            products={products}
            activeCollection={effectiveCollection}
            activeSub={effectiveSub}
            activeSort={sort}
            collectionImages={collectionImages}
          />
        </div>

        <div className="products-shop-main">
          {!isBoardsCollection ? (
            <ShopSortBar
              activeCollection={effectiveCollection}
              activeSub={effectiveSub}
              activeSort={sort}
            />
          ) : null}
          {isBoardsCollection ? (
            <>
              {showPriceBoards ? <PriceBoardsGrid products={products} /> : null}
              {showCategoryBoards ? (
                <BoardsGrid title="Category Boards" products={products} />
              ) : null}
            </>
          ) : null}

          {visibleSections.map((section) => (
            <div key={section.key} className="products-shop-block">
              <div className="products-shop-block-head">
                <h2>{section.title}</h2>
                <span className="products-shop-count">
                  {section.items.length}{" "}
                  {section.items.length === 1 ? "product" : "products"}
                </span>
              </div>
              {section.items.length ? (
                <div className="products-shop-grid">
                  {section.items.map((product, index) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="products-shop-empty">
                  No active listings in this series right now. Check back soon —
                  more fantasy pins are on the way.
                </p>
              )}
            </div>
          ))}

          {showBoards && !isBoardsCollection ? (
            <>
              <PriceBoardsGrid products={products} />
              <BoardsGrid title="Category Boards" products={products} />
            </>
          ) : null}

          {visibleSections.length === 0 &&
          !showPriceBoards &&
          !showCategoryBoards &&
          !showBoards ? (
            <p className="products-shop-empty">
              No products match this filter yet.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
