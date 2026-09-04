import { Product } from "@/lib/store-data";
import { BOARDS_UI_ENABLED } from "@/lib/feature-flags";

export type ShopCollectionKey =
  | "new-releases"
  | "fantasy"
  | "international-preorder"
  | "stickers"
  | "accessories"
  | "boards"
  | "all-products";

export const SHOP_COLLECTIONS: { label: string; key: "" | ShopCollectionKey }[] =
  [
    { label: "All Products", key: "" },
    { label: "New Release", key: "new-releases" },
    { label: "Fantasy Pins", key: "fantasy" },
    { label: "International Preorders", key: "international-preorder" },
    { label: "Boards", key: "boards" },
    { label: "Individually Priced", key: "all-products" },
    { label: "Stickers", key: "stickers" },
    { label: "Trading Accessories", key: "accessories" },
  ];

export function getVisibleShopCollections() {
  if (BOARDS_UI_ENABLED) return SHOP_COLLECTIONS;
  return SHOP_COLLECTIONS.filter((item) => item.key !== "boards");
}

export const BOARD_SUBCATEGORIES: { label: string; key: string }[] = [
  { label: "All", key: "" },
  { label: "Price Boards", key: "price-boards" },
  { label: "Category Boards", key: "category-boards" },
];

const PARENT_COLLECTION_HANDLES = new Set([
  "frontpage",
  "all-products",
  "best-seller",
  "best-sellers",
  "new-releases",
  "new-release",
  "fantasy",
  "sticker",
  "stickers",
  "international-preorders",
  "international-preorder",
  "international",
]);

/**
 * Fantasy "Shop By Series" — keep these visible even with no active listings
 * (matches the Shopify Fantasy collection page).
 */
export const FANTASY_SERIES_ALWAYS: { label: string; key: string }[] = [
  { label: "First Class Postage", key: "first-class-postage" },
  { label: "Magical Destinations", key: "magical-destinations" },
  { label: "Fantasy Collaborations", key: "fantasy-collaborations" },
  { label: "Bubble Buddies", key: "bubble-buddies" },
  { label: "Cutesy Cravings", key: "cutesy-cravings" },
  { label: "Profile", key: "profile" },
  { label: "I Wish Fantasy", key: "i-wish-fantasy" },
  { label: "D'orables", key: "dorables" },
  { label: "Baymax Zodiacs", key: "baymax-zodiacs" },
  { label: "Tinies", key: "tinies" },
  { label: "Adorbs Fantasy", key: "adorbs-fantasy" },
  { label: "Wedding Adorbs", key: "wedding" },
];

export type ShopSeriesItem = {
  label: string;
  key: string;
  count: number;
  image?: string;
};

const INTERNATIONAL_PREORDER_COLLECTION_HANDLES = new Set([
  "international-preorders",
  "international-preorder",
  "international",
]);

export function isShopifyInternationalPreorder(product: Product) {
  return Boolean(
    product.shopifyCollections?.some((item) =>
      INTERNATIONAL_PREORDER_COLLECTION_HANDLES.has(item.handle),
    ),
  );
}

export function productMatchesCollection(
  product: Product,
  collection?: string,
) {
  if (!collection || collection === "all-products") return true;
  if (collection === "new-releases") {
    return product.collection === "new-releases" || product.badge === "New";
  }
  if (collection === "fantasy") {
    return (
      product.collection === "fantasy" ||
      Boolean(
        product.shopifyCollections?.some((item) => item.handle === "fantasy"),
      )
    );
  }
  if (collection === "international-preorder") {
    return (
      product.collection === "international-preorder" ||
      isShopifyInternationalPreorder(product)
    );
  }
  if (collection === "stickers") return product.category === "stickers";
  if (collection === "accessories") {
    return (
      product.category === "accessories" ||
      /popper|clutch|remover|accessor|trading/i.test(
        `${product.name} ${product.shortDescription}`,
      )
    );
  }
  if (collection === "boards") return false;
  return product.collection === collection;
}

export function isInternationalPreorderProduct(
  product: Pick<Product, "collection" | "badge" | "shopifyCollections">,
) {
  return productMatchesCollection(product as Product, "international-preorder");
}

export function productMatchesSeries(product: Product, series?: string) {
  if (!series) return true;
  if (series === "price-boards" || series === "category-boards") return true;
  return Boolean(
    product.shopifyCollections?.some((item) => item.handle === series),
  );
}

export function getSeriesForProducts(products: Product[]): ShopSeriesItem[] {
  const byHandle = new Map<string, ShopSeriesItem>();

  const productImage = (product: Product) =>
    product.image || product.variants?.find((variant) => variant.image)?.image;

  for (const product of products) {
    const fallback = productImage(product);
    for (const item of product.shopifyCollections ?? []) {
      const handle = item.handle?.trim();
      if (!handle || PARENT_COLLECTION_HANDLES.has(handle)) continue;
      const image = item.image || fallback;
      const existing = byHandle.get(handle);
      if (existing) {
        existing.count += 1;
        if (!existing.image && image) existing.image = image;
      } else {
        byHandle.set(handle, {
          key: handle,
          label: item.title || handle,
          count: 1,
          image,
        });
      }
    }
  }

  return [...byHandle.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Merge live product series with always-visible Fantasy series (including empty ones). */
export function getFantasySeriesList(
  products: Product[],
  collectionImages?: Map<string, string> | Record<string, string>,
): ShopSeriesItem[] {
  const fromProducts = getSeriesForProducts(products);
  const byHandle = new Map(fromProducts.map((item) => [item.key, item]));
  const imageLookup =
    collectionImages instanceof Map
      ? collectionImages
      : new Map(Object.entries(collectionImages ?? {}));

  for (const series of FANTASY_SERIES_ALWAYS) {
    const existing = byHandle.get(series.key);
    const image = imageLookup.get(series.key) || existing?.image;
    if (existing) {
      existing.label = series.label;
      if (!existing.image && image) existing.image = image;
    } else {
      byHandle.set(series.key, {
        key: series.key,
        label: series.label,
        count: 0,
        image,
      });
    }
  }

  const order = new Map(
    FANTASY_SERIES_ALWAYS.map((item, index) => [item.key, index]),
  );

  return [...byHandle.values()].sort((a, b) => {
    const aOrder = order.get(a.key);
    const bOrder = order.get(b.key);
    if (aOrder != null && bOrder != null) return aOrder - bOrder;
    if (aOrder != null) return -1;
    if (bOrder != null) return 1;
    return a.label.localeCompare(b.label);
  });
}

export function collectionLabel(collection?: string) {
  return (
    SHOP_COLLECTIONS.find((item) => item.key === (collection || ""))?.label ||
    "All Products"
  );
}

export function seriesLabel(
  products: Product[],
  series?: string,
  collection?: string,
) {
  if (!series) return "";
  const board = BOARD_SUBCATEGORIES.find((item) => item.key === series);
  if (board) return board.label;
  if (collection === "fantasy") {
    const fantasy = FANTASY_SERIES_ALWAYS.find((item) => item.key === series);
    if (fantasy) return fantasy.label;
  }
  return (
    getSeriesForProducts(products).find((item) => item.key === series)?.label ||
    series
  );
}

export function buildShopHref(input: { collection?: string; sub?: string }) {
  const params = new URLSearchParams();
  if (input.collection) params.set("collection", input.collection);
  if (input.sub) params.set("sub", input.sub);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}
