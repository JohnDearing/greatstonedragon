import {
  boards as boardTemplates,
  type Board,
  type BoardCategory,
} from "./boards";
import type { Product } from "./store-data";

function isBoardListingProduct(product: Product) {
  return /\bboard\b/i.test(product.name);
}

/** Fill board frames with real Shopify products grouped by category + price. */
export function hydrateBoardsFromCatalog(catalog: Product[]): Board[] {
  const withVariant = catalog.filter(
    (product) => product.variantId && !isBoardListingProduct(product),
  );

  return boardTemplates.map((template) => {
    const products = withVariant
      .filter(
        (product) =>
          product.category === template.category &&
          Math.round(product.price) === template.pricePerItem,
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!products.length) {
      return { ...template, items: [] };
    }

    return {
      ...template,
      image: products[0]?.image ?? template.image,
      items: products.map((product, index) => ({
        id: `${template.id}-product-${product.id}`,
        number: index + 1,
        pinName: product.name,
        status: "available" as const,
        image: product.image ?? template.image,
        productId: product.id,
        slug: product.slug,
        variantId: product.variantId,
        price: product.price,
      })),
    };
  });
}

export function getHydratedBoards(catalog: Product[]) {
  return hydrateBoardsFromCatalog(catalog);
}

export function getHydratedBoard(
  catalog: Product[],
  category: BoardCategory,
  slug: string,
) {
  return hydrateBoardsFromCatalog(catalog).find(
    (board) => board.category === category && board.slug === slug,
  );
}

export function getHydratedBoardsByCategory(
  catalog: Product[],
  category: BoardCategory,
) {
  return hydrateBoardsFromCatalog(catalog).filter(
    (board) => board.category === category,
  );
}
