/** Shopify Customer Accounts portal (new customer accounts). */
export const SHOPIFY_ACCOUNT_URL =
  process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL?.replace(/\/$/, "") ||
  "https://account.greatstonedragon.com";
