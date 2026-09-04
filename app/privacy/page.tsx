import { PolicyPage } from "@/components/policy-page";
import { privacyPolicy } from "@/lib/policies";

export default function PrivacyPage() {
  return <PolicyPage document={privacyPolicy} />;
}
