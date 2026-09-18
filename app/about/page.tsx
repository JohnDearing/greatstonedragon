import InnerHero from "@/components/inner-hero";
import { JoinCtaSection } from "@/components/join-cta-section";
import TheStory from "@/components/the-story";

export default function AboutPage() {
  return (
    <>
      <InnerHero
        title="About Us"
        description="From one Disneyland mystery pack to a shop for collectors who find magic beyond the spotlight."
      />
      <TheStory />
      <JoinCtaSection />
    </>
  );
}
