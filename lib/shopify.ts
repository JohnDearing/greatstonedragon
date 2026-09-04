import { Product } from "./store-data";

type ShopifyMoney = {
  amount: string;
  currencyCode?: string;
};

type ShopifyVariantNode = {
  id: string;
  title: string;
  availableForSale?: boolean;
  quantityAvailable?: number | null;
  price?: ShopifyMoney;
  image?: { url?: string | null } | null;
  quantityRule?: {
    maximum?: number | null;
    minimum?: number | null;
    increment?: number | null;
  } | null;
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  productType: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  images?: { nodes: { url: string }[] };
  priceRange?: { minVariantPrice?: ShopifyMoney };
  compareAtPriceRange?: { minVariantPrice?: ShopifyMoney };
  collections?: {
    nodes: { handle: string; title: string; image?: { url?: string | null } | null }[];
  };
  variants?: { nodes: ShopifyVariantNode[] };
};

type AjaxProduct = {
  id: number | string;
  handle: string;
  title: string;
  body_html?: string;
  tags?: string[] | string;
  product_type?: string;
  variants?: {
    id: number | string;
    title?: string;
    price?: string;
    compare_at_price?: string | null;
    available?: boolean;
  }[];
  images?: { src?: string }[];
};

type ShopifyAuth =
  | { mode: "private"; token: string }
  | { mode: "public"; token: string };

const PRODUCTS_QUERY = `
  query CatalogProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        tags
        productType
        featuredImage {
          url
          altText
        }
        images(first: 3) {
          nodes {
            url
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
          }
        }
        collections(first: 25) {
          nodes {
            handle
            title
            image {
              url
            }
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable
            image {
              url
            }
            price {
              amount
              currencyCode
            }
            quantityRule {
              maximum
              minimum
              increment
            }
          }
        }
      }
    }
  }
`;

let cachedPrivateToken: { value: string; expiresAt: number } | null = null;

function shopifyConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  );
  if (!domain) return null;

  return {
    domain,
    clientId: process.env.SHOPIFY_STOREFRONT_CLIENT_ID?.trim() || null,
    clientSecret: process.env.SHOPIFY_STOREFRONT_CLIENT_SECRET?.trim() || null,
    staticToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() || null,
  };
}

export function isShopifyConfigured() {
  const config = shopifyConfig();
  if (!config) return false;
  return Boolean(
    config.staticToken || (config.clientId && config.clientSecret) || config.domain,
  );
}

async function getPrivateAccessToken(
  domain: string,
  clientId: string,
  clientSecret: string,
) {
  const now = Date.now();
  if (cachedPrivateToken && cachedPrivateToken.expiresAt > now + 60_000) {
    return cachedPrivateToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify token request failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!json.access_token) {
    throw new Error("Shopify token response missing access_token");
  }

  cachedPrivateToken = {
    value: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000,
  };

  return json.access_token;
}

async function resolveAuth(): Promise<{ domain: string; auth: ShopifyAuth } | null> {
  const config = shopifyConfig();
  if (!config) return null;

  if (config.clientId && config.clientSecret) {
    const token = await getPrivateAccessToken(
      config.domain,
      config.clientId,
      config.clientSecret,
    );
    return { domain: config.domain, auth: { mode: "private", token } };
  }

  if (config.staticToken) {
    return {
      domain: config.domain,
      auth: { mode: "public", token: config.staticToken },
    };
  }

  return { domain: config.domain, auth: { mode: "public", token: "" } };
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { cache?: RequestCache },
) {
  const resolved = await resolveAuth();
  if (!resolved?.auth.token) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (resolved.auth.mode === "private") {
    headers["Shopify-Storefront-Private-Token"] = resolved.auth.token;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = resolved.auth.token;
  }

  const response = await fetch(
    `https://${resolved.domain}/api/2026-07/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: options?.cache ?? "default",
      ...(options?.cache === "no-store" ? {} : { next: { revalidate: 60 } }),
    },
  );

  if (!response.ok) {
    throw new Error(`Shopify request failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data ?? null;
}

/** Server-side Storefront API helper (cart mutations use no-store). */
export async function storefrontGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
) {
  return shopifyFetch<T>(query, variables, { cache: "no-store" });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTags(tags: string[] | string | undefined) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function mapCollection(input: {
  title: string;
  tags: string[];
  collectionHandles?: string;
}): Product["collection"] {
  const hay =
    `${input.collectionHandles ?? ""} ${input.title} ${input.tags.join(" ")}`.toLowerCase();

  if (
    hay.includes("int preorder") ||
    hay.includes("international preorder") ||
    hay.includes("dlp preorder") ||
    (hay.includes("international") && hay.includes("preorder"))
  ) {
    return "international-preorder";
  }

  if (hay.includes("new-release") || hay.includes("new release")) {
    return "new-releases";
  }

  if (
    (hay.includes("fantasy preorder") || hay.includes("fantasy pre-order")) &&
    !hay.includes("int preorder") &&
    !hay.includes("dlp preorder") &&
    !hay.includes("international preorder")
  ) {
    return "fantasy";
  }

  if (
    hay.includes("preorder") ||
    hay.includes("pre-order") ||
    hay.includes("international")
  ) {
    return "international-preorder";
  }
  if (hay.includes("fantasy")) return "fantasy";
  return "all-products";
}

function mapCategory(input: {
  title: string;
  tags: string[];
  productType?: string;
  collectionHandles?: string;
}): Product["category"] {
  const hay =
    `${input.productType ?? ""} ${input.tags.join(" ")} ${input.title} ${input.collectionHandles ?? ""}`.toLowerCase();
  if (hay.includes("sticker")) return "stickers";
  if (
    hay.includes("accessor") ||
    hay.includes("trading") ||
    hay.includes("popper") ||
    hay.includes("clutch") ||
    hay.includes("remover") ||
    hay.includes("backer") ||
    hay.includes("locker")
  ) {
    return "accessories";
  }
  return "pins";
}

function mapBadge(input: { title: string; tags: string[] }): Product["badge"] | undefined {
  const hay = `${input.tags.join(" ")} ${input.title}`.toLowerCase();
  if (hay.includes("preorder") || hay.includes("pre-order")) return "Preorder";
  if (hay.includes("best seller") || hay.includes("bestseller")) {
    return "Best Seller";
  }
  if (hay.includes("limited") || /\ble\b/.test(hay)) return "Limited";
  if (hay.includes("new")) return "New";
  return undefined;
}

function toVariantGid(id: number | string) {
  const raw = String(id);
  if (raw.startsWith("gid://")) return raw;
  return `gid://shopify/ProductVariant/${raw}`;
}

function pickVariantId(
  variants: ShopifyVariantNode[] | undefined,
): string | undefined {
  if (!variants?.length) return undefined;
  const available = variants.find((v) => v.availableForSale !== false);
  return (available ?? variants[0]).id;
}

function mapGraphqlProduct(node: ShopifyProductNode): Product {
  const description = stripHtml(node.description || "");
  const variants = node.variants?.nodes ?? [];
  const primaryVariant =
    variants.find((v) => v.availableForSale !== false) ?? variants[0];
  const price = Number(
    primaryVariant?.price?.amount ??
      node.priceRange?.minVariantPrice?.amount ??
      0,
  );
  const compareAt = Number(
    node.compareAtPriceRange?.minVariantPrice?.amount ?? 0,
  );
  const tags = node.tags ?? [];
  const image =
    node.featuredImage?.url || node.images?.nodes?.[0]?.url || undefined;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    shortDescription:
      description.slice(0, 110) ||
      "Collectible fantasy pin from Great Stone Dragon.",
    description:
      description || "Collectible fantasy pin from Great Stone Dragon.",
    price,
    compareAtPrice: compareAt > price ? compareAt : undefined,
    badge: mapBadge({ title: node.title, tags }),
    category: mapCategory({
      title: node.title,
      tags,
      productType: node.productType,
      collectionHandles:
        node.collections?.nodes.map((item) => item.handle).join(" ") ?? "",
    }),
    collection: mapCollection({
      title: node.title,
      tags,
      collectionHandles:
        node.collections?.nodes.map((item) => item.handle).join(" ") ?? "",
    }),
    tags,
    productType: node.productType || undefined,
    shopifyCollections: node.collections?.nodes.map((item) => ({
      handle: item.handle,
      title: item.title,
      image: item.image?.url || undefined,
    })),
    colors: ["#eecbd7", "#d4a4b9"],
    image,
    rating: 5,
    reviews: 0,
    variantId: pickVariantId(variants),
    variants: variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      price: Number(variant.price?.amount ?? 0),
      image: variant.image?.url ?? undefined,
      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable ?? null,
      quantityMaximum: variant.quantityRule?.maximum ?? null,
    })),
  };
}

function mapAjaxProduct(node: AjaxProduct): Product {
  const tags = normalizeTags(node.tags);
  const description = stripHtml(node.body_html || "");
  const variants = node.variants ?? [];
  const primaryVariant = variants[0];
  const price = Number(primaryVariant?.price ?? 0);
  const compareAt = Number(primaryVariant?.compare_at_price ?? 0);

  return {
    id: String(node.id),
    slug: node.handle,
    name: node.title,
    shortDescription:
      description.slice(0, 110) ||
      "Collectible fantasy pin from Great Stone Dragon.",
    description:
      description || "Collectible fantasy pin from Great Stone Dragon.",
    price,
    compareAtPrice: compareAt > price ? compareAt : undefined,
    badge: mapBadge({ title: node.title, tags }),
    category: mapCategory({
      title: node.title,
      tags,
      productType: node.product_type,
    }),
    collection: mapCollection({ title: node.title, tags }),
    tags,
    productType: node.product_type || undefined,
    colors: ["#eecbd7", "#d4a4b9"],
    image: node.images?.[0]?.src,
    rating: 5,
    reviews: 0,
    variantId: primaryVariant?.id
      ? toVariantGid(primaryVariant.id)
      : undefined,
  };
}

async function fetchAjaxProducts(domain: string): Promise<Product[]> {
  const response = await fetch(`https://${domain}/products.json?limit=50`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Shopify products.json failed: ${response.status}`);
  }

  const json = (await response.json()) as { products?: AjaxProduct[] };
  return (json.products ?? []).map(mapAjaxProduct);
}

type CatalogProductsResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    nodes: ShopifyProductNode[];
  };
};

type CatalogCollectionsResponse = {
  collections: {
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    nodes: { handle: string; title: string; image?: { url?: string | null } | null }[];
  };
};

const COLLECTIONS_QUERY = `
  query CatalogCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        title
        image {
          url
        }
      }
    }
  }
`;

async function fetchCollectionImages() {
  const images = new Map<string, string>();
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: CatalogCollectionsResponse | null =
      await shopifyFetch<CatalogCollectionsResponse>(COLLECTIONS_QUERY, {
        first: 100,
        after,
      });
    if (!data?.collections) break;

    for (const node of data.collections.nodes) {
      if (node.handle && node.image?.url) {
        images.set(node.handle, node.image.url);
      }
    }

    hasNextPage = Boolean(data.collections.pageInfo.hasNextPage);
    after = data.collections.pageInfo.endCursor ?? null;
    if (images.size >= 250) break;
  }

  return images;
}

/** Public helper for series thumbnails (including empty Fantasy series). */
export async function fetchShopifyCollectionImages() {
  try {
    return await fetchCollectionImages();
  } catch (error) {
    console.error("Shopify collection images fetch failed", error);
    return new Map<string, string>();
  }
}

export async function fetchShopifyProducts(): Promise<Product[] | null> {
  const config = shopifyConfig();
  if (!config) return null;

  try {
    const nodes: ShopifyProductNode[] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const data: CatalogProductsResponse | null =
        await shopifyFetch<CatalogProductsResponse>(PRODUCTS_QUERY, {
          first: 100,
          after,
        });

      if (!data?.products) break;

      nodes.push(...data.products.nodes);
      hasNextPage = Boolean(data.products.pageInfo.hasNextPage);
      after = data.products.pageInfo.endCursor ?? null;

      if (nodes.length >= 500) break;
    }

    const mapped = nodes.map(mapGraphqlProduct);
    if (mapped.length) {
      const images = await fetchCollectionImages();
      if (images.size) {
        return mapped.map((product) => ({
          ...product,
          shopifyCollections: product.shopifyCollections?.map((item) => ({
            ...item,
            image: images.get(item.handle) || item.image,
          })),
        }));
      }
      return mapped;
    }

    return await fetchAjaxProducts(config.domain);
  } catch (error) {
    console.error("Shopify catalog fetch failed", error);
    try {
      return await fetchAjaxProducts(config.domain);
    } catch (fallbackError) {
      console.error("Shopify products.json fallback failed", fallbackError);
      return null;
    }
  }
}
