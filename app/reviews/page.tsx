import InnerHero from "@/components/inner-hero";
import ReviewsGridSection from "@/components/reviews-grid-section";
import ReviewTrustSlider from "@/components/review-trust-slider";

export default function ReviewsPage() {
  return (
    <>
      <InnerHero
        title="Reviews"
        description="The story behind the studio crafted with love for the collector community."
      />
      <ReviewsGridSection />
      <ReviewTrustSlider />
    </>
  );
}
