import { money, type Board } from "./boards";
import type { Product } from "./store-data";

function isBoardListingProduct(product: Product) {
  return /\bboard\b/i.test(product.name);
}

function priceBoardSlug(price: number) {
  return `${price}-dollar-board`;
}

/** Build boards grouped by price only — all product types at the same price. */
export function buildPriceBoardsFromCatalog(catalog: Product[]): Board[] {
  const withVariant = catalog.filter(
    (product) => product.variantId && !isBoardListingProduct(product),
  );

  const byPrice = new Map<number, Product[]>();

  for (const product of withVariant) {
    const price = Math.round(product.price);
    if (!byPrice.has(price)) byPrice.set(price, []);
    byPrice.get(price)!.push(product);
  }

  return Array.from(byPrice.entries())
    .sort(([a], [b]) => a - b)
    .map(([price, products]) => {
      const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

      return {
        id: `board-price-${price}`,
        slug: priceBoardSlug(price),
        title: `${money(price)} Board`,
        category: "pins" as const,
        grouping: "price" as const,
        pricePerItem: price,
        description: `Every ${money(price)} product on one board. Multi-select across pins, stickers, and accessories, then add them all to your cart.`,
        image: sorted[0]?.image ?? "/images/product/product1.png",
        items: sorted.map((product, index) => ({
          id: `board-price-${price}-product-${product.id}`,
          number: index + 1,
          pinName: product.name,
          status: "available" as const,
          image: product.image ?? "/images/product/product1.png",
          productId: product.id,
          slug: product.slug,
          variantId: product.variantId,
          price: product.price,
        })),
      };
    });
}

export function getPriceBoard(catalog: Product[], slug: string) {
  return buildPriceBoardsFromCatalog(catalog).find((board) => board.slug === slug);
}

export function getPriceBoards(catalog: Product[]) {
  return buildPriceBoardsFromCatalog(catalog).filter((board) => board.items.length);
}
