import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { ProductDescription } from "@/components/product-description";
import { ProductGallery } from "@/components/product-gallery";
import { PromoPopupHost } from "@/components/promo-popup-host";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const catalog = await getCatalogProducts();
  const related = catalog
    .filter(
      (item) => item.id !== product.id && item.collection === product.collection,
    )
    .slice(0, 4);

  return (
    <main className="page-block single-product-page">
      <section className="container product-layout">
        <div className="product-media-col">
          <ProductGallery product={product} />
        </div>

        <div className="product-info">
          {product.badge ? <p className="pill">{product.badge}</p> : null}
          <h1>{product.name}</h1>
          <ProductDescription
            html={product.descriptionHtml}
            text={product.description}
          />
          {product.reviews > 0 ? (
            <p className="rating-line">
              {product.rating.toFixed(1)} stars from {product.reviews} verified
              reviews
            </p>
          ) : (
            <p className="rating-line">Live product from Shopify</p>
          )}
          <ProductActions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              variantId: product.variantId,
              variants: product.variants,
              badge: product.badge,
            }}
          />
          <Link href="/products" className="single-product-back">
            ← Back to all products
          </Link>
        </div>
      </section>

      {related.length ? (
        <section className="container related-block">
          <h2>You may also like</h2>
          <div className="products-grid">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
      <PromoPopupHost
        page="product-detail"
        product={{
          collection: product.collection,
          badge: product.badge,
          shopifyCollections: product.shopifyCollections,
        }}
      />
    </main>
  );
}
