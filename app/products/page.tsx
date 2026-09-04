import { ProductsShopSection } from "@/components/products-shop-section";
import { PromoPopupHost } from "@/components/promo-popup-host";
import { getCatalogProducts, getCollectionImages } from "@/lib/catalog";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    sub?: string;
    quick?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [catalog, collectionImageMap] = await Promise.all([
    getCatalogProducts(),
    getCollectionImages(),
  ]);

  const collectionImages = Object.fromEntries(collectionImageMap.entries());

  return (
    <main>
      <ProductsShopSection
        products={catalog}
        activeCollection={params.collection || params.category}
        activeSub={params.sub}
        collectionImages={collectionImages}
      />
      <PromoPopupHost
        collection={params.collection}
        category={params.category}
        page="products"
      />
    </main>
  );
}
