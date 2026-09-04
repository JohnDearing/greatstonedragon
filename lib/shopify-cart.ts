import { storefrontGraphql } from "./shopify";

export type ShopifyCartLine = {
  lineId: string;
  variantId: string;
  slug: string;
  name: string;
  subtitle?: string;
  price: number;
  qty: number;
  lineTotal: number;
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
  subtotal: number;
  currencyCode: string;
  lines: ShopifyCartLine[];
  warnings?: ShopifyCartWarning[];
};

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      attributes {
        key
        value
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          quantityAvailable
          price {
            amount
            currencyCode
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

type CartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: {
    subtotalAmount?: { amount: string; currencyCode?: string };
    totalAmount?: { amount: string; currencyCode?: string };
  };
  lines?: {
    nodes: {
      id: string;
      quantity: number;
      attributes?: { key: string; value: string }[];
      merchandise?: {
        id?: string;
        title?: string;
        price?: { amount: string };
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

      return {
        lineId: line.id,
        variantId: merch.id,
        slug: merch.product.handle,
        name: productTitle,
        subtitle: variantTitle || undefined,
        price: unitPrice,
        qty: line.quantity,
        lineTotal: unitPrice * line.quantity,
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

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: Number(node.cost?.subtotalAmount?.amount ?? 0),
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
