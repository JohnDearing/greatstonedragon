import ContactHelpSection from "@/components/contact-help-section";
import ContactFormSection from "@/components/contact-form-section";
import InnerHero from "@/components/inner-hero";


export default function ContactPage() {
  return (
    <>
      <InnerHero
        title="Contact Us"
        description="I am happy to assist with any questions or inquires. 
        Just fill out this form or email the appropriate email below, 
        and I'll get back to you as soon as possible."
      />
      <ContactFormSection />
      <ContactHelpSection />
    </>
  );
}
