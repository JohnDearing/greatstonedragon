export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  descriptionHtml?: string;
  price: number;
  compareAtPrice?: number;
  badge?: "New" | "Preorder" | "Best Seller" | "Limited";
  category: "pins" | "stickers" | "accessories";
  collection: "new-releases" | "international-preorder" | "fantasy" | "all-products";
  colors: [string, string];
  image?: string;
  rating: number;
  reviews: number;
  /** Shopify product tags used for series / extra filters */
  tags?: string[];
  productType?: string;
  shopifyCollections?: { handle: string; title: string; image?: string }[];
  /** Shopify Storefront variant GID used for cart/checkout */
  variantId?: string;
  /** All Shopify variants when available (for board pin matching) */
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  image?: string;
  availableForSale?: boolean;
  /** Shopify quantity rule maximum; null means no explicit cap from Shopify. */
  quantityMaximum?: number | null;
  /** Available inventory units from Shopify Storefront API. */
  quantityAvailable?: number | null;
};

import { BOARDS_UI_ENABLED } from "./feature-flags";

export const shopNav = [
  { label: "Home", href: "/" },
  { label: "Pin Store", href: "/products", mega: "pin-store" as const },
  { label: "Sticker Store", href: "/products?collection=stickers" },
  { label: "Trading Accessories", href: "/products?collection=accessories" },
  { label: "Boards", href: "/products?collection=boards" },
  { label: "FAQS", href: "/faqs" },
  { label: "Reviews", href: "/reviews" },
  { label: "About Me", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function getVisibleShopNav() {
  if (BOARDS_UI_ENABLED) return shopNav;
  return shopNav.filter((item) => item.href !== "/products?collection=boards");
}

export const pinStoreMega = [
  {
    label: "All Products",
    href: "/products",
    eyebrow: "All Products",
    image: "/images/home/hero-card2.png",
  },
  {
    label: "International",
    href: "/products?collection=international-preorder",
    eyebrow: "International Pins",
    image: "/images/home/hero-card4.png",
  },
  {
    label: "Fantasy",
    href: "/products?collection=fantasy",
    eyebrow: "Fantasy Pins",
    image: "/images/home/hero-card5.png",
  },
] as const;

export const products: Product[] = [
  {
    id: "p-001",
    slug: "stitch-pocket-parks-le-1500-hinge-pin",
    name: "Stitch Pocket Parks LE 1500 Hinge Pin",
    shortDescription: "Collector hinge pin with premium layered detailing.",
    description:
      "A premium hinged collector piece inspired by pocket park adventures. Built for display boards and daily carry pouches.",
    price: 55,
    badge: "New",
    category: "pins",
    collection: "new-releases",
    colors: ["#eecbd7", "#d4a4b9"],
    rating: 4.9,
    reviews: 214,
  },
  {
    id: "p-002",
    slug: "merida-i-wish-fantasy-pin",
    name: "PREORDER: Merida - I Wish Fantasy Pin",
    shortDescription: "Limited fantasy preorder for the I Wish series.",
    description:
      "Part of the fan-favorite I Wish line, this preorder release features detailed linework and a warm fantasy palette.",
    price: 70,
    badge: "Preorder",
    category: "pins",
    collection: "international-preorder",
    colors: ["#f7dce5", "#bf7f94"],
    rating: 5,
    reviews: 82,
  },
  {
    id: "p-003",
    slug: "belle-i-wish-fantasy-pin",
    name: "PREORDER: Belle - I Wish Fantasy Pin",
    shortDescription: "Elegant collector pin with floral gold accents.",
    description:
      "An elegant fantasy design with signature rose-inspired accents and polished metal trim for premium display.",
    price: 70,
    badge: "Preorder",
    category: "pins",
    collection: "fantasy",
    colors: ["#f1d5dc", "#bd6e86"],
    rating: 5,
    reviews: 77,
  },
  {
    id: "p-004",
    slug: "maleficent-i-wish-fantasy-pin",
    name: "PREORDER: Maleficent - I Wish Fantasy Pin",
    shortDescription: "Dramatic fantasy finish for dark fairytale fans.",
    description:
      "A bold fantasy collectible blending deep tones with polished highlights, made for statement pinboards.",
    price: 70,
    badge: "Preorder",
    category: "pins",
    collection: "fantasy",
    colors: ["#d8c0d1", "#8d3c55"],
    rating: 4.9,
    reviews: 64,
  },
  {
    id: "p-005",
    slug: "sorcerer-mickey-i-wish-fantasy-pin",
    name: "PREORDER: Sorcerer Mickey - I Wish Fantasy Pin",
    shortDescription: "A magical fantasy preorder with rich detailing.",
    description:
      "Part of the I Wish line, designed for collectors looking for nostalgic storytelling and premium enamel quality.",
    price: 70,
    badge: "Preorder",
    category: "pins",
    collection: "international-preorder",
    colors: ["#ecd2dc", "#ae5b75"],
    rating: 5,
    reviews: 71,
  },
  {
    id: "p-006",
    slug: "bubble-buddies-sticker-pack",
    name: "Bubble Buddies Sticker Pack",
    shortDescription: "Glossy weather-resistant sticker trio.",
    description:
      "Three collectible stickers made for water bottles, laptops, and pin storage boxes. Durable finish and vibrant print.",
    price: 18,
    badge: "Best Seller",
    category: "stickers",
    collection: "all-products",
    colors: ["#fbe5ec", "#dba6ba"],
    rating: 4.8,
    reviews: 43,
  },
  {
    id: "p-007",
    slug: "pin-display-trading-board",
    name: "Pin Display Trading Board",
    shortDescription: "Travel-ready display board for events and meetups.",
    description:
      "A lightweight board with protective lining for trading nights and conventions. Keeps your grails secure and visible.",
    price: 36,
    badge: "Best Seller",
    category: "accessories",
    collection: "all-products",
    colors: ["#f3dbe3", "#c78ea2"],
    rating: 4.9,
    reviews: 58,
  },
  {
    id: "p-008",
    slug: "first-class-postage-upgrade",
    name: "First Class Postage Upgrade",
    shortDescription: "Priority shipping add-on for faster delivery.",
    description:
      "Upgrade in-stock orders for priority handling and faster domestic shipping timelines.",
    price: 8,
    badge: "Limited",
    category: "accessories",
    collection: "all-products",
    colors: ["#f2d3de", "#c98298"],
    rating: 4.7,
    reviews: 29,
  },
];

export const collectionHighlights = [
  { title: "All Products", href: "/products" },
  { title: "New Releases", href: "/products?collection=new-releases" },
  {
    title: "International Preorder",
    href: "/products?collection=international-preorder",
  },
  { title: "Fantasy", href: "/products?collection=fantasy" },
];

export const faqItems = [
  {
    q: "When do in-hand items ship?",
    a: "In-stock orders are processed and shipped within 48 hours.",
  },
  {
    q: "How do preorders work?",
    a: "Preorders include timeline updates and guaranteed fulfillment before shipment.",
  },
  {
    q: "Do you offer international shipping?",
    a: "Yes, international preorder and standard shipping options are available at checkout.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug);
}

export function money(price: number) {
  return `$${price.toFixed(2)} USD`;
}
