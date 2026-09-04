import { PolicyPage } from "@/components/policy-page";
import { shippingPolicy } from "@/lib/policies";

export default function ShippingPage() {
  return <PolicyPage document={shippingPolicy} />;
}
