import { fetchShopifyCollectionImages, fetchShopifyProducts } from "./shopify";
import { Product, products as fallbackProducts } from "./store-data";

export async function getCatalogProducts(): Promise<Product[]> {
  const live = await fetchShopifyProducts();
  return live?.length ? live : fallbackProducts;
}

export async function getCatalogProductBySlug(slug: string) {
  const catalog = await getCatalogProducts();
  return catalog.find((item) => item.slug === slug);
}

export async function getCollectionImages() {
  return fetchShopifyCollectionImages();
}

export function filterCatalog(
  catalog: Product[],
  filters: { category?: string; collection?: string },
) {
  return catalog.filter((item) => {
    const passCategory = !filters.category || item.category === filters.category;
    const passCollection =
      !filters.collection || item.collection === filters.collection;
    return passCategory && passCollection;
  });
}
