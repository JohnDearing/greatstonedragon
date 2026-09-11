import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = {
  access: "gsd_ca_access",
  refresh: "gsd_ca_refresh",
  idToken: "gsd_ca_id",
  expires: "gsd_ca_expires",
  state: "gsd_ca_state",
  nonce: "gsd_ca_nonce",
  verifier: "gsd_ca_verifier",
} as const;

const SCOPE = "openid email customer-account-api:full";

type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type CustomerApiConfig = {
  graphql_api: string;
};

export type CustomerAccountSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

export type CustomerAddress = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
  territoryCode?: string | null;
  zoneCode?: string | null;
  formatted: string[];
  isDefault: boolean;
};

export type CustomerAddressInput = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  territoryCode: string;
  zoneCode?: string;
};

export type CustomerProfile = {
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  addressLines: string[];
  addresses: CustomerAddress[];
};

export type CustomerOrderLine = {
  name: string;
  quantity: number;
  total: string;
  amount: number;
  image?: string | null;
  variantId?: string | null;
  productId?: string | null;
};

export type CustomerOrderSummary = {
  id: string;
  name: string;
  number: string;
  processedAt: string;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  headline: "Complete" | "Confirmed";
  isComplete: boolean;
  total: string;
  image?: string | null;
  lineItems: CustomerOrderLine[];
};

export type CustomerOrderDetail = CustomerOrderSummary & {
  statusPageUrl?: string | null;
  email?: string | null;
  billingLines: string[];
  shippingLines: string[];
  subtotal: string;
  shipping: string;
  totalAmount: string;
  currencyCode: string;
  fulfilledAt?: string | null;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

let openIdCache: OpenIdConfig | null = null;
let graphqlCache: string | null = null;

export function customerAccountClientId() {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() || "";
}

export function customerAccountClientSecret() {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim() || "";
}

export function isCustomerAccountConfigured() {
  return Boolean(customerAccountClientId() && shopDomain());
}

export function shopDomain() {
  return (
    process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(
      /\/$/,
      "",
    ) || ""
  );
}

const NEXTJS_SITE_URL = "https://www.greatstonedragon.com";

export function publicSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const storefront =
    process.env.SHOPIFY_STOREFRONT_URL?.replace(/\/$/, "") ||
    "https://zwyg987.greatstonedragon.com";
  if (!raw) return NEXTJS_SITE_URL;
  if (raw === storefront || raw.includes("zwyg987.")) return NEXTJS_SITE_URL;
  if (raw.startsWith("http://") || raw.includes("localhost")) return NEXTJS_SITE_URL;
  return raw;
}

export function isLocalHost(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") || new URL(request.url).host;
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    url.protocol.replace(":", "") ||
    "https";
  return `${proto}://${host}`;
}

/** Always the Next.js store. Never the Shopify theme subdomain. */
export function oauthOrigin(_request?: Request) {
  return publicSiteUrl();
}

export function callbackUrl(request: Request) {
  return `${oauthOrigin(request)}/api/auth/callback`;
}

export function logoutRedirectUrl(request: Request) {
  return `${oauthOrigin(request)}/`;
}

function base64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function randomToken(bytes = 32) {
  return base64Url(randomBytes(bytes));
}

export function pkceChallenge(verifier: string) {
  return base64Url(createHash("sha256").update(verifier).digest());
}

async function discoverOpenId(): Promise<OpenIdConfig> {
  if (openIdCache) return openIdCache;
  const domain = shopDomain();
  const response = await fetch(
    `https://${domain}/.well-known/openid-configuration`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Could not discover Shopify login endpoints (${response.status})`);
  }
  openIdCache = (await response.json()) as OpenIdConfig;
  return openIdCache;
}

async function discoverGraphqlEndpoint() {
  if (graphqlCache) return graphqlCache;
  const domain = shopDomain();
  const response = await fetch(
    `https://${domain}/.well-known/customer-account-api`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Could not discover Customer Account API (${response.status})`);
  }
  const json = (await response.json()) as CustomerApiConfig;
  if (!json.graphql_api) {
    throw new Error("Customer Account API GraphQL endpoint missing");
  }
  graphqlCache = json.graphql_api;
  return graphqlCache;
}

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function buildAuthorizationUrl(request: Request) {
  const clientId = customerAccountClientId();
  if (!clientId) throw new Error("Missing SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID");

  const config = await discoverOpenId();
  const state = randomToken(16);
  const nonce = randomToken(16);
  const verifier = randomToken(32);
  const challenge = pkceChallenge(verifier);
  const redirectUri = callbackUrl(request);

  const url = new URL(config.authorization_endpoint);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return { url: url.toString(), state, nonce, verifier };
}

function tokenHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "GreatStoneDragon/1.0",
  };
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (origin) headers.Origin = origin;

  const secret = customerAccountClientSecret();
  const clientId = customerAccountClientId();
  if (secret && clientId) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
  }
  return headers;
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const config = await discoverOpenId();
  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: tokenHeaders(),
    body,
    cache: "no-store",
  });
  const json = (await response.json()) as TokenResponse;
  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description || json.error || `Token request failed (${response.status})`,
    );
  }
  return json;
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  redirectUri: string;
  verifier: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: customerAccountClientId(),
    redirect_uri: input.redirectUri,
    code: input.code,
    code_verifier: input.verifier,
  });
  return postToken(body);
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: customerAccountClientId(),
    refresh_token: refreshToken,
  });
  return postToken(body);
}

export async function buildLogoutUrl(request: Request, idToken?: string) {
  const config = await discoverOpenId();
  const url = new URL(config.end_session_endpoint);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", logoutRedirectUrl(request));
  return url.toString();
}

export async function readPendingAuth() {
  const jar = await cookies();
  return {
    state: jar.get(COOKIE.state)?.value,
    nonce: jar.get(COOKIE.nonce)?.value,
    verifier: jar.get(COOKIE.verifier)?.value,
  };
}

export async function readSessionCookies(): Promise<Partial<CustomerAccountSession>> {
  const jar = await cookies();
  const expires = Number(jar.get(COOKIE.expires)?.value || 0);
  return {
    accessToken: jar.get(COOKIE.access)?.value,
    refreshToken: jar.get(COOKIE.refresh)?.value,
    idToken: jar.get(COOKIE.idToken)?.value,
    expiresAt: Number.isFinite(expires) ? expires : 0,
  };
}

export function applyPendingAuthCookies(
  headers: Headers,
  pending: { state: string; nonce: string; verifier: string },
) {
  const opts = cookieBase(60 * 10);
  setCookie(headers, COOKIE.state, pending.state, opts);
  setCookie(headers, COOKIE.nonce, pending.nonce, opts);
  setCookie(headers, COOKIE.verifier, pending.verifier, opts);
}

export function applySessionCookies(headers: Headers, tokens: TokenResponse) {
  const expiresIn = Number(tokens.expires_in || 3600);
  const expiresAt = Date.now() + expiresIn * 1000;
  const accessAge = Math.max(60, expiresIn);
  const refreshAge = 60 * 60 * 24 * 30;

  setCookie(headers, COOKIE.access, tokens.access_token || "", cookieBase(accessAge));
  setCookie(headers, COOKIE.expires, String(expiresAt), cookieBase(refreshAge));
  if (tokens.refresh_token) {
    setCookie(headers, COOKIE.refresh, tokens.refresh_token, cookieBase(refreshAge));
  }
  if (tokens.id_token) {
    setCookie(headers, COOKIE.idToken, tokens.id_token, cookieBase(refreshAge));
  }
  clearCookie(headers, COOKIE.state);
  clearCookie(headers, COOKIE.nonce);
  clearCookie(headers, COOKIE.verifier);
}

export function clearAuthCookies(headers: Headers) {
  for (const name of Object.values(COOKIE)) clearCookie(headers, name);
}

function setCookie(
  headers: Headers,
  name: string,
  value: string,
  options: ReturnType<typeof cookieBase>,
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
    "HttpOnly",
  ];
  if (options.secure) parts.push("Secure");
  headers.append("Set-Cookie", parts.join("; "));
}

function clearCookie(headers: Headers, name: string) {
  headers.append(
    "Set-Cookie",
    `${name}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
}

export function sessionNeedsRefresh(session: Partial<CustomerAccountSession>) {
  if (!session.refreshToken) return false;
  if (!session.accessToken) return true;
  return (session.expiresAt || 0) <= Date.now() + 30_000;
}

export async function requireLoggedIn() {
  const session = await readSessionCookies();
  if (!session.accessToken && !session.refreshToken) {
    redirect("/api/auth/login");
  }
  return session;
}

export async function requireAccountSession(next = "/account/order") {
  const session = await requireLoggedIn();
  if (sessionNeedsRefresh(session)) {
    redirect(`/api/auth/refresh?next=${encodeURIComponent(next)}`);
  }
  return session;
}

async function getValidAccessToken(): Promise<string | null> {
  const session = await readSessionCookies();
  return session.accessToken || null;
}

async function customerGraphql<T>(query: string, variables?: Record<string, unknown>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const endpoint = await discoverGraphqlEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
      "User-Agent": "GreatStoneDragon/1.0",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (!response.ok || json.errors?.length) {
    throw new Error(json.errors?.[0]?.message || `Customer API failed (${response.status})`);
  }

  return json.data ?? null;
}

function moneyLabel(amount?: string | null, currency?: string | null) {
  const value = Number(amount || 0);
  const code = currency || "USD";
  if (code === "USD") return `$${value.toFixed(2)} USD`;
  return `${value.toFixed(2)} ${code}`;
}

function moneyPlain(amount?: string | null, currency?: string | null) {
  const value = Number(amount || 0);
  const code = currency || "USD";
  if (code === "USD") return `$${value.toFixed(2)}`;
  return `${value.toFixed(2)} ${code}`;
}

export function isOrderComplete(status?: string | null) {
  const value = (status || "").toUpperCase();
  return value === "FULFILLED" || value === "SUCCESS" || value === "COMPLETE";
}

export function orderHeadline(status?: string | null): "Complete" | "Confirmed" {
  return isOrderComplete(status) ? "Complete" : "Confirmed";
}

export function orderNumber(name: string) {
  const trimmed = name.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

type OrderLineNode = {
  name: string;
  quantity: number;
  image?: { url?: string | null } | null;
  variantId?: string | null;
  productId?: string | null;
  currentTotalPrice?: { amount: string; currencyCode?: string } | null;
  price?: { amount: string; currencyCode?: string } | null;
};

function mapLineItems(nodes?: OrderLineNode[] | null): CustomerOrderLine[] {
  return (nodes ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    total: moneyPlain(
      item.currentTotalPrice?.amount,
      item.currentTotalPrice?.currencyCode,
    ),
    amount: Number(item.currentTotalPrice?.amount || item.price?.amount || 0),
    image: item.image?.url || null,
    variantId: item.variantId || null,
    productId: item.productId || null,
  }));
}

export async function fetchCustomerAccount() {
  const data = await customerGraphql<{
    customer: {
      firstName?: string | null;
      lastName?: string | null;
      displayName?: string | null;
      emailAddress?: { emailAddress?: string | null } | null;
      defaultAddress?: { id?: string | null; formatted?: string[] | null } | null;
      addresses?: {
        nodes?: {
          id: string;
          firstName?: string | null;
          lastName?: string | null;
          address1?: string | null;
          address2?: string | null;
          city?: string | null;
          province?: string | null;
          zip?: string | null;
          country?: string | null;
          territoryCode?: string | null;
          zoneCode?: string | null;
          formatted?: string[] | null;
        }[];
      } | null;
      orders?: {
        nodes?: {
          id: string;
          name: string;
          processedAt: string;
          financialStatus?: string | null;
          fulfillmentStatus?: string | null;
          totalPrice?: { amount: string; currencyCode?: string } | null;
          lineItems?: { nodes?: OrderLineNode[] } | null;
        }[];
      } | null;
    } | null;
  }>(`
    query AccountHome {
      customer {
        firstName
        lastName
        displayName
        emailAddress { emailAddress }
        defaultAddress { id formatted }
        addresses(first: 25) {
          nodes {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            territoryCode
            zoneCode
            formatted(withName: true)
          }
        }
        orders(first: 25) {
          nodes {
            id
            name
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice { amount currencyCode }
            lineItems(first: 8) {
              nodes {
                name
                quantity
                image { url }
                variantId
                productId
                currentTotalPrice { amount currencyCode }
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
  `);

  const customer = data?.customer;
  if (!customer) return null;

  const defaultId = customer.defaultAddress?.id || "";
  const addresses: CustomerAddress[] = (customer.addresses?.nodes ?? []).map((address) => ({
    id: address.id,
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    province: address.province,
    zip: address.zip,
    country: address.country,
    territoryCode: address.territoryCode,
    zoneCode: address.zoneCode,
    formatted: address.formatted?.filter(Boolean) ?? [],
    isDefault: Boolean(defaultId && address.id === defaultId),
  }));

  const profile: CustomerProfile = {
    displayName:
      customer.displayName ||
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      "Collector",
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.emailAddress?.emailAddress || null,
    addressLines: customer.defaultAddress?.formatted?.filter(Boolean) ?? [],
    addresses,
  };

  const orders: CustomerOrderSummary[] = (customer.orders?.nodes ?? [])
    .map((order) => {
      const lineItems = mapLineItems(order.lineItems?.nodes);
      return {
        id: order.id,
        name: order.name,
        number: orderNumber(order.name),
        processedAt: order.processedAt,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        headline: orderHeadline(order.fulfillmentStatus),
        isComplete: isOrderComplete(order.fulfillmentStatus),
        total: moneyLabel(order.totalPrice?.amount, order.totalPrice?.currencyCode),
        image: lineItems.find((item) => item.image)?.image || null,
        lineItems,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime(),
    );

  return { profile, orders };
}

export async function fetchCustomerOrder(id: string) {
  const data = await customerGraphql<{
    order: {
      id: string;
      name: string;
      processedAt: string;
      financialStatus?: string | null;
      fulfillmentStatus?: string | null;
      statusPageUrl?: string | null;
      email?: string | null;
      currencyCode?: string | null;
      totalPrice?: { amount: string; currencyCode?: string } | null;
      subtotal?: { amount: string; currencyCode?: string } | null;
      totalShipping?: { amount: string; currencyCode?: string } | null;
      billingAddress?: { formatted?: string[] | null } | null;
      shippingAddress?: { formatted?: string[] | null } | null;
      fulfillments?: { nodes?: { createdAt?: string | null; status?: string | null }[] } | null;
      lineItems?: { nodes?: OrderLineNode[] } | null;
    } | null;
  }>(
    `
    query OrderDetail($id: ID!) {
      order(id: $id) {
        id
        name
        processedAt
        financialStatus
        fulfillmentStatus
        statusPageUrl
        email
        currencyCode
        totalPrice { amount currencyCode }
        subtotal { amount currencyCode }
        totalShipping { amount currencyCode }
        billingAddress { formatted(withName: true) }
        shippingAddress { formatted(withName: true) }
        fulfillments(first: 5) {
          nodes { createdAt status }
        }
        lineItems(first: 50) {
          nodes {
            name
            quantity
            image { url }
            variantId
            productId
            currentTotalPrice { amount currencyCode }
            price { amount currencyCode }
          }
        }
      }
    }
  `,
    { id },
  );

  const order = data?.order;
  if (!order) return null;

  const lineItems = mapLineItems(order.lineItems?.nodes);
  const shippingAmount = Number(order.totalShipping?.amount || 0);
  const fulfilledAt =
    order.fulfillments?.nodes?.find((item) => item.createdAt)?.createdAt || null;

  return {
    id: order.id,
    name: order.name,
    number: orderNumber(order.name),
    processedAt: order.processedAt,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    headline: orderHeadline(order.fulfillmentStatus),
    isComplete: isOrderComplete(order.fulfillmentStatus),
    total: moneyLabel(order.totalPrice?.amount, order.totalPrice?.currencyCode),
    image: lineItems.find((item) => item.image)?.image || null,
    lineItems,
    statusPageUrl: order.statusPageUrl,
    email: order.email || null,
    billingLines: order.billingAddress?.formatted?.filter(Boolean) ?? [],
    shippingLines: order.shippingAddress?.formatted?.filter(Boolean) ?? [],
    subtotal: moneyPlain(order.subtotal?.amount, order.subtotal?.currencyCode),
    shipping: shippingAmount === 0 ? "Free" : moneyPlain(order.totalShipping?.amount, order.totalShipping?.currencyCode),
    totalAmount: moneyPlain(order.totalPrice?.amount, order.totalPrice?.currencyCode),
    currencyCode: order.currencyCode || order.totalPrice?.currencyCode || "USD",
    fulfilledAt,
  } satisfies CustomerOrderDetail;
}

export function encodeOrderParam(id: string) {
  return base64Url(Buffer.from(id));
}

export function decodeOrderParam(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOrderShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function prettyStatus(value?: string | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type MutationUserError = { field?: string[] | null; message: string };

function mutationError(errors?: MutationUserError[] | null) {
  return errors?.[0]?.message || "";
}

export async function updateCustomerProfile(input: {
  firstName: string;
  lastName: string;
}) {
  const data = await customerGraphql<{
    customerUpdate?: {
      userErrors?: MutationUserError[];
    };
  }>(
    `
    mutation UpdateCustomer($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) {
        userErrors { field message }
      }
    }
  `,
    { input },
  );
  const error = mutationError(data?.customerUpdate?.userErrors);
  if (error) throw new Error(error);
}

export async function createCustomerAddress(
  address: CustomerAddressInput,
  defaultAddress: boolean,
) {
  const data = await customerGraphql<{
    customerAddressCreate?: {
      userErrors?: MutationUserError[];
    };
  }>(
    `
    mutation CreateAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) {
      customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
        userErrors { field message }
      }
    }
  `,
    { address, defaultAddress },
  );
  const error = mutationError(data?.customerAddressCreate?.userErrors);
  if (error) throw new Error(error);
}

export async function updateCustomerAddress(
  addressId: string,
  address: CustomerAddressInput,
  defaultAddress: boolean,
) {
  const data = await customerGraphql<{
    customerAddressUpdate?: {
      userErrors?: MutationUserError[];
    };
  }>(
    `
    mutation UpdateAddress(
      $addressId: ID!
      $address: CustomerAddressInput!
      $defaultAddress: Boolean
    ) {
      customerAddressUpdate(
        addressId: $addressId
        address: $address
        defaultAddress: $defaultAddress
      ) {
        userErrors { field message }
      }
    }
  `,
    { addressId, address, defaultAddress },
  );
  const error = mutationError(data?.customerAddressUpdate?.userErrors);
  if (error) throw new Error(error);
}

export async function deleteCustomerAddress(addressId: string) {
  const data = await customerGraphql<{
    customerAddressDelete?: {
      userErrors?: MutationUserError[];
    };
  }>(
    `
    mutation DeleteAddress($addressId: ID!) {
      customerAddressDelete(addressId: $addressId) {
        userErrors { field message }
      }
    }
  `,
    { addressId },
  );
  const error = mutationError(data?.customerAddressDelete?.userErrors);
  if (error) throw new Error(error);
}
