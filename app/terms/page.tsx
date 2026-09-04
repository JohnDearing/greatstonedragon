import { PolicyPage } from "@/components/policy-page";
import { termsOfService } from "@/lib/policies";

export default function TermsPage() {
  return <PolicyPage document={termsOfService} />;
}
