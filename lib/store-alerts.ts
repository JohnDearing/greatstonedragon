import { toast } from "sonner";

/** Brand Sonner alert — same pattern as checkout terms toast. */
export function showStoreAlert(message: string) {
  toast.error(message, {
    action: {
      label: "OK",
      onClick: () => toast.dismiss(),
    },
  });
}

export function availabilityLimitMessage(maxQty: number) {
  if (maxQty <= 1) {
    return "Only 1 item is available for this product due to availability.";
  }
  return `Only ${maxQty} items are available for this product due to availability.`;
}

export function showAvailabilityLimitToast(maxQty: number) {
  showStoreAlert(availabilityLimitMessage(maxQty));
}
