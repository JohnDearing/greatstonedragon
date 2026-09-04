"use client";

import { Toaster } from "sonner";

export function StoreToaster() {
  return (
    <Toaster
      position="bottom-center"
      closeButton
      duration={6000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "store-toast",
          title: "store-toast-title",
          description: "store-toast-description",
          actionButton: "store-toast-action",
          closeButton: "store-toast-close",
          error: "store-toast is-error",
          success: "store-toast is-success",
        },
      }}
    />
  );
}
