import { CollectorFavoritesSection } from "@/components/collector-favorites-section";
import { CollectorStorySection } from "@/components/collector-story-section";
import { CommunitySection } from "@/components/community-section";
import { ConfidenceSection } from "@/components/confidence-section";
import { HomeHero } from "@/components/home-hero";
import { JoinCtaSection } from "@/components/join-cta-section";
import { NewReleasesSection } from "@/components/new-releases-section";
import { ShopCollectionsSection } from "@/components/shop-collections-section";
import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { getCatalogProducts } from "@/lib/catalog";

export default async function Home() {
  const catalog = await getCatalogProducts();
  const newReleases = catalog.filter(
    (item) => item.collection === "new-releases" || item.badge === "New",
  );
  const featured: typeof catalog = [];
  const featuredIds = new Set<string>();
  for (const item of [...newReleases, ...catalog]) {
    if (featured.length >= 4) break;
    if (featuredIds.has(item.id)) continue;
    featuredIds.add(item.id);
    featured.push(item);
  }
  const favorites = catalog
    .filter((item) => item.badge === "Best Seller" || item.collection === "fantasy")
    .concat(catalog)
    .filter(
      (item, index, list) => list.findIndex((entry) => entry.id === item.id) === index,
    )
    .slice(0, 6);

  return (
    <main>
      <HomeHero />
      <StatsSection />
      <NewReleasesSection products={featured} />
      <CollectorFavoritesSection products={favorites} />
      <ShopCollectionsSection />
      <CommunitySection />
      <CollectorStorySection />
      <TestimonialsSection />
      <ConfidenceSection />
      <JoinCtaSection />
    </main>
  );
}
