import {
  addManyToShopifyCart,
  addToShopifyCart,
  getShopifyCart,
  removeShopifyCartLines,
  updateShopifyCartLines,
} from "@/lib/shopify-cart";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cartId = new URL(request.url).searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await getShopifyCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Shopify cart fetch failed", error);
    return NextResponse.json(
      { error: "Unable to load cart", cart: null },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cartId?: string | null;
      variantId?: string;
      quantity?: number;
      attributes?: { key: string; value: string }[];
      lines?: {
        variantId: string;
        quantity?: number;
        attributes?: { key: string; value: string }[];
      }[];
    };

    if (body.lines?.length) {
      const cart = await addManyToShopifyCart(
        body.cartId,
        body.lines.map((line) => ({
          merchandiseId: line.variantId,
          quantity: Math.max(1, line.quantity ?? 1),
          ...(line.attributes?.length ? { attributes: line.attributes } : {}),
        })),
      );

      if (!cart) {
        return NextResponse.json(
          { error: "Shopify cart unavailable" },
          { status: 502 },
        );
      }

      return NextResponse.json({ cart });
    }

    if (!body.variantId) {
      return NextResponse.json(
        { error: "variantId or lines is required" },
        { status: 400 },
      );
    }

    const cart = await addToShopifyCart(
      body.cartId,
      body.variantId,
      Math.max(1, body.quantity ?? 1),
      body.attributes,
    );

    if (!cart) {
      return NextResponse.json(
        { error: "Shopify cart unavailable" },
        { status: 502 },
      );
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Shopify cart add failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update cart",
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      cartId?: string;
      lineId?: string;
      quantity?: number;
    };

    if (!body.cartId || !body.lineId || body.quantity === undefined) {
      return NextResponse.json(
        { error: "cartId, lineId, and quantity are required" },
        { status: 400 },
      );
    }

    const cart = await updateShopifyCartLines(body.cartId, [
      { id: body.lineId, quantity: body.quantity },
    ]);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Shopify cart update failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update cart",
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      cartId?: string;
      lineId?: string;
    };

    if (!body.cartId || !body.lineId) {
      return NextResponse.json(
        { error: "cartId and lineId are required" },
        { status: 400 },
      );
    }

    const cart = await removeShopifyCartLines(body.cartId, [body.lineId]);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Shopify cart remove failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update cart",
      },
      { status: 502 },
    );
  }
}
