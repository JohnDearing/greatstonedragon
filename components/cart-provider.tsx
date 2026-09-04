"use client";

import { CartToast } from "@/components/cart-toast";
import type { ShopifyCart } from "@/lib/shopify-cart";
import { showStoreAlert } from "@/lib/store-alerts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SHOPIFY_CART_KEY = "shopify_cart_id";

export type CartLineItem = {
  id: string;
  lineId: string;
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

type AddItemInput = {
  id: string;
  slug: string;
  name: string;
  price: number;
  variantId: string;
  href?: string;
  attributes?: { key: string; value: string }[];
};

type AddItemOptions = {
  silent?: boolean;
};

type CartContextValue = {
  items: CartLineItem[];
  count: number;
  subtotal: number;
  checkoutUrl: string | null;
  loading: boolean;
  addItem: (
    item: AddItemInput,
    qty?: number,
    options?: AddItemOptions,
  ) => Promise<number>;
  addItems: (items: AddItemInput[], options?: AddItemOptions) => Promise<number>;
  showCartToast: (message?: string, count?: number) => void;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
};

function showCartWarnings(cart: ShopifyCart) {
  const messages = cart.warnings
    ?.map((warning) => warning.message.trim())
    .filter(Boolean);
  if (!messages?.length) return;
  showStoreAlert(messages.join(" "));
}

async function readCartResponse(response: Response) {
  const json = (await response.json()) as {
    cart?: ShopifyCart | null;
    error?: string;
  };

  if (!response.ok || !json.cart) {
    throw new Error(json.error ?? "Unable to update cart");
  }

  return json.cart;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function mapShopifyLines(cart: ShopifyCart | null): CartLineItem[] {
  if (!cart) return [];
  return cart.lines.map((line) => ({
    id: line.lineId,
    lineId: line.lineId,
    slug: line.slug,
    name: line.name,
    subtitle: line.subtitle,
    price: line.price,
    qty: line.qty,
    lineTotal: line.lineTotal,
    quantityMaximum: line.quantityMaximum,
    quantityAvailable: line.quantityAvailable,
    image: line.image,
    href: line.href,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const cartIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    count: number;
    visible: boolean;
  }>({ message: "Added to cart", count: 0, visible: false });

  const persistCartId = useCallback((id: string | null) => {
    cartIdRef.current = id;
    setCartId(id);
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem(SHOPIFY_CART_KEY, id);
    else window.localStorage.removeItem(SHOPIFY_CART_KEY);
  }, []);

  const applyCart = useCallback(
    (cart: ShopifyCart | null) => {
      setShopifyCart(cart);
      persistCartId(cart?.id ?? null);
      return cart;
    },
    [persistCartId],
  );

  const loadShopifyCart = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`);
      const json = (await response.json()) as { cart: ShopifyCart | null };
      if (json.cart) {
        setShopifyCart(json.cart);
        persistCartId(json.cart.id);
        return json.cart;
      }
      persistCartId(null);
      setShopifyCart(null);
      return null;
    },
    [persistCartId],
  );

  useEffect(() => {
    const storedId = window.localStorage.getItem(SHOPIFY_CART_KEY);
    window.localStorage.removeItem("greatstonedragon-local-cart");
    cartIdRef.current = storedId;
    setCartId(storedId);

    const boot = async () => {
      if (storedId) {
        await loadShopifyCart(storedId);
      }
      setLoading(false);
    };

    void boot();
  }, [loadShopifyCart]);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showCartToast = useCallback((message = "Added to cart", count?: number) => {
    setToast({
      message,
      count: count ?? 0,
      visible: true,
    });
  }, []);

  const addItem = useCallback(
    async (item: AddItemInput, qty = 1, options?: AddItemOptions) => {
      if (!item.variantId) {
        throw new Error("This item is not available for checkout yet.");
      }

      setLoading(true);
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId: cartIdRef.current,
            variantId: item.variantId,
            quantity: qty,
            attributes: item.attributes,
          }),
        });

        const json = (await response.json()) as {
          cart?: ShopifyCart | null;
          error?: string;
        };

        if (!response.ok || !json.cart) {
          throw new Error(json.error ?? "Unable to add to cart");
        }

        applyCart(json.cart);
        showCartWarnings(json.cart);

        if (!options?.silent) {
          showCartToast("Added to cart", json.cart.totalQuantity);
        }

        return json.cart.totalQuantity;
      } finally {
        setLoading(false);
      }
    },
    [applyCart, showCartToast],
  );

  const addItems = useCallback(
    async (items: AddItemInput[], options?: AddItemOptions) => {
      if (!items.length) return 0;

      const lines = items.filter((item) => item.variantId);
      if (!lines.length) {
        throw new Error("These items are not available for checkout yet.");
      }

      setLoading(true);
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId: cartIdRef.current,
            lines: lines.map((item) => ({
              variantId: item.variantId,
              quantity: 1,
              attributes: item.attributes,
            })),
          }),
        });

        const json = (await response.json()) as {
          cart?: ShopifyCart | null;
          error?: string;
        };

        if (!response.ok || !json.cart) {
          throw new Error(json.error ?? "Unable to add to cart");
        }

        applyCart(json.cart);
        showCartWarnings(json.cart);

        if (!options?.silent) {
          showCartToast("Added to cart", json.cart.totalQuantity);
        }

        return json.cart.totalQuantity;
      } finally {
        setLoading(false);
      }
    },
    [applyCart, showCartToast],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const activeCartId = cartIdRef.current;
      if (!activeCartId) return;

      setLoading(true);
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId: activeCartId, lineId: id }),
        });
        const cart = await readCartResponse(response);
        applyCart(cart);
      } finally {
        setLoading(false);
      }
    },
    [applyCart],
  );

  const updateQty = useCallback(
    async (id: string, qty: number) => {
      if (qty <= 0) {
        await removeItem(id);
        return;
      }

      const activeCartId = cartIdRef.current;
      if (!activeCartId) {
        throw new Error("Cart not available. Please refresh the page.");
      }

      setLoading(true);
      try {
        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId: activeCartId,
            lineId: id,
            quantity: qty,
          }),
        });
        const cart = await readCartResponse(response);
        applyCart(cart);
        showCartWarnings(cart);
      } finally {
        setLoading(false);
      }
    },
    [applyCart, removeItem],
  );

  const clearCart = useCallback(() => {
    setShopifyCart(null);
    persistCartId(null);
  }, [persistCartId]);

  const value = useMemo<CartContextValue>(() => {
    const items = mapShopifyLines(shopifyCart);
    const count = shopifyCart?.totalQuantity ?? 0;
    const subtotal = shopifyCart?.subtotal ?? 0;

    return {
      items,
      count,
      subtotal,
      checkoutUrl: shopifyCart?.checkoutUrl ?? null,
      loading,
      addItem,
      addItems,
      showCartToast,
      updateQty,
      removeItem,
      clearCart,
    };
  }, [
    shopifyCart,
    loading,
    addItem,
    addItems,
    showCartToast,
    updateQty,
    removeItem,
    clearCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast
        message={toast.message}
        count={toast.count}
        visible={toast.visible}
        onDismiss={dismissToast}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
