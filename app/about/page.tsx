import InnerHero from "@/components/inner-hero";
import { JoinCtaSection } from "@/components/join-cta-section";
import TheStory from "@/components/the-story";

export default function AboutPage() {
  return (
    <>
      <InnerHero
        title="About Us"
        description="The story behind the studio crafted with love for the collector community."
      />
      <TheStory />
      <JoinCtaSection />
    </>
  );
}
