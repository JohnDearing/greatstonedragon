import FaqsSection from "@/components/faqs-section";
import InnerHero from "@/components/inner-hero";
import { JoinCtaSection } from "@/components/join-cta-section";

export default function FaqsPage() {
  return (
    <>
      <InnerHero
        title="FAQs"
        description="Everything you need to know about pins, preorders, and shipping."
      />
      <FaqsSection />
      <JoinCtaSection />
    </>
  );
}
