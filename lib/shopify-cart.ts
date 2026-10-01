import { storefrontGraphql } from "./shopify";

export type ShopifyCartDiscount = {
  title: string;
  amount: number;
};

export type ShopifyCartLine = {
  lineId: string;
  variantId: string;
  slug: string;
  name: string;
  subtitle?: string;
  price: number;
  qty: number;
  lineTotal: number;
  /** Pre-discount merchandise total for this line (unit price × qty). */
  lineSubtotal: number;
  discountAmount: number;
  discountTitle?: string;
  quantityMaximum?: number | null;
  quantityAvailable?: number | null;
  image?: string;
  href?: string;
};

export type ShopifyCartWarning = {
  code?: string;
  message: string;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  /** Paid merchandise total after discounts (shipping/tax excluded). */
  subtotal: number;
  /** Merchandise total before discounts. */
  merchandiseSubtotal: number;
  /** Total automatic/code discount amount applied to the cart. */
  discountTotal: number;
  discounts: ShopifyCartDiscount[];
  currencyCode: string;
  lines: ShopifyCartLine[];
  warnings?: ShopifyCartWarning[];
};

const MONEY_FIELDS = `
  amount
  currencyCode
`;

const DISCOUNT_ALLOCATION_FIELDS = `
  discountedAmount {
    ${MONEY_FIELDS}
  }
  ... on CartAutomaticDiscountAllocation {
    title
  }
  ... on CartCodeDiscountAllocation {
    code
  }
  ... on CartCustomDiscountAllocation {
    title
  }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      ${MONEY_FIELDS}
    }
    totalAmount {
      ${MONEY_FIELDS}
    }
  }
  discountAllocations {
    ${DISCOUNT_ALLOCATION_FIELDS}
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      attributes {
        key
        value
      }
      cost {
        amountPerQuantity {
          ${MONEY_FIELDS}
        }
        subtotalAmount {
          ${MONEY_FIELDS}
        }
        totalAmount {
          ${MONEY_FIELDS}
        }
      }
      discountAllocations {
        ${DISCOUNT_ALLOCATION_FIELDS}
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          quantityAvailable
          price {
            ${MONEY_FIELDS}
          }
          quantityRule {
            maximum
          }
          image {
            url
          }
          product {
            handle
            title
            featuredImage {
              url
            }
          }
        }
      }
    }
  }
`;

type MoneyNode = { amount?: string; currencyCode?: string } | null | undefined;

type DiscountAllocationNode = {
  discountedAmount?: MoneyNode;
  title?: string | null;
  code?: string | null;
};

type CartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: {
    subtotalAmount?: MoneyNode;
    totalAmount?: MoneyNode;
  };
  discountAllocations?: DiscountAllocationNode[] | null;
  lines?: {
    nodes: {
      id: string;
      quantity: number;
      attributes?: { key: string; value: string }[];
      cost?: {
        amountPerQuantity?: MoneyNode;
        subtotalAmount?: MoneyNode;
        totalAmount?: MoneyNode;
      } | null;
      discountAllocations?: DiscountAllocationNode[] | null;
      merchandise?: {
        id?: string;
        title?: string;
        price?: MoneyNode;
        quantityAvailable?: number | null;
        quantityRule?: { maximum?: number | null } | null;
        image?: { url?: string } | null;
        product?: {
          handle?: string;
          title?: string;
          featuredImage?: { url?: string } | null;
        };
      };
    }[];
  };
};

function moneyAmount(value: MoneyNode) {
  return Number(value?.amount ?? 0);
}

function discountTitle(allocation: DiscountAllocationNode) {
  const title = allocation.title?.trim() || allocation.code?.trim();
  return title || "Discount";
}

function mapDiscounts(
  allocations: DiscountAllocationNode[] | null | undefined,
): ShopifyCartDiscount[] {
  const byTitle = new Map<string, number>();

  for (const allocation of allocations ?? []) {
    const amount = moneyAmount(allocation.discountedAmount);
    if (amount <= 0) continue;
    const title = discountTitle(allocation);
    byTitle.set(title, (byTitle.get(title) ?? 0) + amount);
  }

  return [...byTitle.entries()].map(([title, amount]) => ({ title, amount }));
}

function publicCheckoutUrl(url: string) {
  const storefront = process.env.SHOPIFY_STOREFRONT_URL?.replace(/\/$/, "");
  if (!storefront || !url) return url;

  try {
    const next = new URL(url);
    const dest = new URL(storefront);
    next.protocol = dest.protocol;
    next.host = dest.host;
    return next.toString();
  } catch {
    return url;
  }
}

function mapCart(
  node: CartNode | null | undefined,
  warnings?: ShopifyCartWarning[],
): ShopifyCart | null {
  if (!node?.id) return null;

  const lines: ShopifyCartLine[] = (node.lines?.nodes ?? [])
    .map((line) => {
      const merch = line.merchandise;
      if (!merch?.id || !merch.product?.handle) return null;

      const productTitle = merch.product.title ?? "Product";
      const variantTitle =
        merch.title && merch.title !== "Default Title" ? merch.title : "";
      const unitPrice = Number(merch.price?.amount ?? 0);
      const quantityAvailable = merch.quantityAvailable ?? null;
      const ruleMax = merch.quantityRule?.maximum ?? null;
      const caps = [ruleMax, quantityAvailable].filter(
        (value): value is number => value != null && value > 0,
      );

      const catalogTotal = unitPrice * line.quantity;
      const apiLineSubtotal = moneyAmount(line.cost?.subtotalAmount);
      const apiLineTotal = moneyAmount(line.cost?.totalAmount);
      const lineDiscounts = mapDiscounts(line.discountAllocations);
      const allocatedDiscount = lineDiscounts.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      // Prefer catalog price as the pre-discount amount so savings stay visible
      // even when Shopify's line cost fields are already discounted.
      const lineSubtotal = Math.max(catalogTotal, apiLineSubtotal);
      const lineTotal = Math.min(
        lineSubtotal,
        apiLineTotal > 0
          ? apiLineTotal
          : allocatedDiscount > 0
            ? Math.max(0, lineSubtotal - allocatedDiscount)
            : lineSubtotal,
      );
      const discountAmount =
        allocatedDiscount || Math.max(0, lineSubtotal - lineTotal);

      return {
        lineId: line.id,
        variantId: merch.id,
        slug: merch.product.handle,
        name: productTitle,
        subtitle: variantTitle || undefined,
        price: unitPrice,
        qty: line.quantity,
        lineTotal,
        lineSubtotal,
        discountAmount,
        discountTitle: lineDiscounts[0]?.title,
        quantityAvailable,
        quantityMaximum: caps.length ? Math.min(...caps) : ruleMax,
        image:
          merch.image?.url ??
          merch.product.featuredImage?.url ??
          undefined,
        href: `/products/${merch.product.handle}`,
      };
    })
    .filter(Boolean) as ShopifyCartLine[];

  const merchandiseSubtotal = lines.reduce(
    (sum, line) => sum + line.lineSubtotal,
    0,
  );
  const apiSubtotal = Number(node.cost?.subtotalAmount?.amount ?? 0);
  const discounts = mapDiscounts(node.discountAllocations);
  const discountFromAllocations = discounts.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const discountFromLines = lines.reduce(
    (sum, line) => sum + line.discountAmount,
    0,
  );
  const discountTotal = Math.max(
    discountFromAllocations,
    discountFromLines,
    Math.max(0, merchandiseSubtotal - apiSubtotal),
  );
  const subtotal = lines.length
    ? Math.max(0, merchandiseSubtotal - discountTotal)
    : apiSubtotal;

  const resolvedDiscounts =
    discounts.length > 0
      ? discounts
      : discountTotal > 0
        ? [
            {
              title:
                lines.find((line) => line.discountTitle)?.discountTitle ||
                "Discount",
              amount: discountTotal,
            },
          ]
        : [];

  return {
    id: node.id,
    checkoutUrl: publicCheckoutUrl(node.checkoutUrl),
    totalQuantity: node.totalQuantity,
    subtotal,
    merchandiseSubtotal,
    discountTotal,
    discounts: resolvedDiscounts,
    currencyCode:
      node.cost?.subtotalAmount?.currencyCode ??
      node.cost?.totalAmount?.currencyCode ??
      "USD",
    lines,
    ...(warnings?.length ? { warnings } : {}),
  };
}

function assertNoErrors(
  userErrors: { field?: string[] | null; message: string }[] | undefined,
) {
  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }
}

function mapWarnings(
  warnings: { code?: string; message: string }[] | undefined,
): ShopifyCartWarning[] {
  return (warnings ?? [])
    .filter((warning) => Boolean(warning.message))
    .map((warning) => ({
      code: warning.code,
      message: warning.message,
    }));
}

export async function getShopifyCart(cartId: string) {
  const data = await storefrontGraphql<{ cart: CartNode | null }>(
    `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ${CART_FIELDS}
        }
      }
    `,
    { cartId },
  );

  return mapCart(data?.cart);
}

export async function createShopifyCart(
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[],
) {
  const data = await storefrontGraphql<{
    cartCreate: {
      cart: CartNode | null;
      userErrors: { message: string }[];
      warnings?: { code?: string; message: string }[];
    };
  }>(
    `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ${CART_FIELDS}
          }
          userErrors {
            field
            message
          }
          warnings {
            code
            message
          }
        }
      }
    `,
    {
      input: { lines },
    },
  );

  assertNoErrors(data?.cartCreate.userErrors);
  return mapCart(data?.cartCreate.cart, mapWarnings(data?.cartCreate.warnings));
}

export async function addLinesToShopifyCart(
  cartId: string,
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[],
) {
  const data = await storefrontGraphql<{
    cartLinesAdd: {
      cart: CartNode | null;
      userErrors: { message: string }[];
      warnings?: { code?: string; message: string }[];
    };
  }>(
    `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FIELDS}
          }
          userErrors {
            field
            message
          }
          warnings {
            code
            message
          }
        }
      }
    `,
    { cartId, lines },
  );

  assertNoErrors(data?.cartLinesAdd.userErrors);
  return mapCart(
    data?.cartLinesAdd.cart,
    mapWarnings(data?.cartLinesAdd.warnings),
  );
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
) {
  const data = await storefrontGraphql<{
    cartLinesUpdate: {
      cart: CartNode | null;
      userErrors: { message: string }[];
      warnings?: { code?: string; message: string }[];
    };
  }>(
    `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FIELDS}
          }
          userErrors {
            field
            message
          }
          warnings {
            code
            message
          }
        }
      }
    `,
    { cartId, lines },
  );

  assertNoErrors(data?.cartLinesUpdate.userErrors);
  return mapCart(
    data?.cartLinesUpdate.cart,
    mapWarnings(data?.cartLinesUpdate.warnings),
  );
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
) {
  const data = await storefrontGraphql<{
    cartLinesRemove: {
      cart: CartNode | null;
      userErrors: { message: string }[];
      warnings?: { code?: string; message: string }[];
    };
  }>(
    `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CART_FIELDS}
          }
          userErrors {
            field
            message
          }
          warnings {
            code
            message
          }
        }
      }
    `,
    { cartId, lineIds },
  );

  assertNoErrors(data?.cartLinesRemove.userErrors);
  return mapCart(
    data?.cartLinesRemove.cart,
    mapWarnings(data?.cartLinesRemove.warnings),
  );
}

export async function addToShopifyCart(
  cartId: string | null | undefined,
  variantId: string,
  quantity: number,
  attributes?: { key: string; value: string }[],
) {
  return addManyToShopifyCart(cartId, [
    {
      merchandiseId: variantId,
      quantity,
      ...(attributes?.length ? { attributes } : {}),
    },
  ]);
}

export async function addManyToShopifyCart(
  cartId: string | null | undefined,
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[],
) {
  if (!lines.length) return null;

  if (cartId) {
    try {
      return await addLinesToShopifyCart(cartId, lines);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/cart does not exist|specified cart/i.test(message)) {
        throw error;
      }
      return createShopifyCart(lines);
    }
  }
  return createShopifyCart(lines);
}
