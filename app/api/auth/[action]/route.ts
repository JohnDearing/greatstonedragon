import {
  applyPendingAuthCookies,
  applySessionCookies,
  buildAuthorizationUrl,
  buildLogoutUrl,
  callbackUrl,
  clearAuthCookies,
  customerAccountClientId,
  exchangeAuthorizationCode,
  isCustomerAccountConfigured,
  isLocalHost,
  oauthOrigin,
  publicSiteUrl,
  readPendingAuth,
  readSessionCookies,
  refreshAccessToken,
} from "@/lib/customer-account";
import { SHOPIFY_ACCOUNT_URL } from "@/lib/shopify-account";
import { NextResponse } from "next/server";

function redirectWithCookies(url: string, mutate?: (headers: Headers) => void) {
  const headers = new Headers();
  mutate?.(headers);
  headers.set("Location", url);
  return new NextResponse(null, { status: 302, headers });
}

export async function GET(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith("/login")) {
    if (!isCustomerAccountConfigured()) {
      return NextResponse.redirect(SHOPIFY_ACCOUNT_URL);
    }
    const site = publicSiteUrl();
    if (isLocalHost(request) && site) {
      return NextResponse.redirect(`${site}/api/auth/login`);
    }
    try {
      const started = await buildAuthorizationUrl(request);
      return redirectWithCookies(started.url, (headers) => {
        applyPendingAuthCookies(headers, {
          state: started.state,
          nonce: started.nonce,
          verifier: started.verifier,
        });
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start Shopify login";
      return NextResponse.redirect(
        new URL(`/?authError=${encodeURIComponent(message)}`, request.url),
      );
    }
  }

  if (pathname.endsWith("/callback")) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const authError = url.searchParams.get("error");
    const pending = await readPendingAuth();

    if (authError) {
      return NextResponse.redirect(
        new URL(`/?authError=${encodeURIComponent(authError)}`, request.url),
      );
    }

    if (!code || !state || !pending.state || state !== pending.state || !pending.verifier) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }

    try {
      const tokens = await exchangeAuthorizationCode({
        code,
        redirectUri: callbackUrl(request),
        verifier: pending.verifier,
      });
      return redirectWithCookies(`${oauthOrigin(request)}/account`, (headers) => {
        applySessionCookies(headers, tokens);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not finish Shopify login";
      return NextResponse.redirect(
        new URL(`/?authError=${encodeURIComponent(message)}`, request.url),
      );
    }
  }

  if (pathname.endsWith("/logout")) {
    const session = await readSessionCookies();
    const headers = new Headers();
    clearAuthCookies(headers);
    if (session.idToken && customerAccountClientId()) {
      const logoutUrl = await buildLogoutUrl(request, session.idToken);
      headers.set("Location", logoutUrl);
    } else {
      headers.set("Location", new URL("/", request.url).toString());
    }
    return new NextResponse(null, { status: 302, headers });
  }

  if (pathname.endsWith("/refresh")) {
    const next = new URL(request.url).searchParams.get("next") || "/account";
    const session = await readSessionCookies();
    if (!session.refreshToken) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
    try {
      const tokens = await refreshAccessToken(session.refreshToken);
      return redirectWithCookies(new URL(next, request.url).toString(), (headers) => {
        applySessionCookies(headers, tokens);
      });
    } catch {
      return redirectWithCookies(new URL("/api/auth/login", request.url).toString(), (headers) => {
        clearAuthCookies(headers);
      });
    }
  }

  if (pathname.endsWith("/session")) {
    const session = await readSessionCookies();
    return NextResponse.json({
      authenticated: Boolean(session.accessToken || session.refreshToken),
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
