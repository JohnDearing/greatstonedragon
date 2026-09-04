export type BoardCategory = "pins" | "stickers" | "accessories";

export type BoardGrouping = "category" | "price";

export type BoardPinStatus = "available" | "sold";

export type BoardPin = {
  id: string;
  number: number;
  pinName: string;
  status: BoardPinStatus;
  image: string;
  /** Live Shopify product fields when the board is hydrated from catalog */
  productId?: string;
  slug?: string;
  variantId?: string;
  price?: number;
};

export type Board = {
  id: string;
  slug: string;
  title: string;
  category: BoardCategory;
  grouping?: BoardGrouping;
  pricePerItem: number;
  description: string;
  image: string;
  items: BoardPin[];
};

const BOARD_PIN_IMAGES = [
  "/images/product/product1.png",
  "/images/product/product2.png",
  "/images/product/product3.png",
  "/images/home/collectorCard1.png",
  "/images/home/collectorCard2.png",
  "/images/home/collectorCard3.png",
  "/images/home/ReleaseCard1.png",
  "/images/home/releaseCard2.png",
  "/images/home/releaseCard3.png",
  "/images/home/releaseCard4.png",
  "/images/home/hero-card1.png",
  "/images/home/hero-card2.png",
  "/images/home/hero-card3.png",
  "/images/home/hero-card4.png",
  "/images/home/hero-card5.png",
  "/images/home/hero-card6.png",
  "/images/home/collectionCard1.png",
  "/images/home/collectionCard2.png",
  "/images/home/collectionCard3.png",
  "/images/home/collectionCard4.png",
];

export const boardCategories: {
  slug: BoardCategory;
  label: string;
  blurb: string;
}[] = [
  {
    slug: "pins",
    label: "Pin Boards",
    blurb: "Pick multiple fantasy pins from a single board frame.",
  },
  {
    slug: "stickers",
    label: "Sticker Boards",
    blurb: "Select several stickers from one board and add them together.",
  },
  {
    slug: "accessories",
    label: "Accessory Boards",
    blurb: "Trading accessories arranged for multi-select checkout.",
  },
];

const PIN_NAMES = [
  "Baymax Glow",
  "Stitch Pocket",
  "Mochi Dream",
  "Yokai Profile",
  "Bride Sparkle",
  "Groom Formal",
  "Flower Girl",
  "Powerline Pop",
  "Raya Postage",
  "Kida Crest",
  "Bolt Flash",
  "Tadashi Soft",
  "Ember Tiny",
  "Wade Tiny",
  "Hades Profile",
  "Rex Clone",
  "Ursula Stamp",
  "Scar Mark",
  "Cruella Line",
  "Chernabog",
  "Facilier Hat",
  "Queen Hearts",
  "Lumpy Soft",
  "Figment Spark",
  "Lilo Smile",
  "Hiro Tech",
  "Rumi Stage",
  "Zoey Beat",
  "Mira Glow",
  "Bernie Tiny",
  "Gale Drift",
  "Lutz Spark",
  "Clod Soft",
  "Ray Firefly",
  "Rajah Guard",
  "Squirt Splash",
];

function buildPins(
  boardId: string,
  prefix: string,
  count: number,
  soldNumbers: number[],
  imageOffset = 0,
): BoardPin[] {
  const sold = new Set(soldNumbers);
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const name = PIN_NAMES[index % PIN_NAMES.length];
    return {
      id: `${boardId}-pin-${number}`,
      number,
      pinName: `${prefix} ${String(number).padStart(2, "0")} · ${name}`,
      status: sold.has(number) ? "sold" : "available",
      image: BOARD_PIN_IMAGES[(index + imageOffset) % BOARD_PIN_IMAGES.length],
    };
  });
}

/** Prefer live Shopify product images when available. */
export function withCatalogImages(board: Board, catalogImages: string[]): Board {
  if (!catalogImages.length) return board;
  return {
    ...board,
    items: board.items.map((pin, index) => ({
      ...pin,
      image: catalogImages[index % catalogImages.length] || pin.image,
    })),
  };
}

export const boards: Board[] = [
  {
    id: "board-pins-10",
    slug: "ten-dollar-fantasy-pin-board",
    title: "$10 Fantasy Pin Board",
    category: "pins",
    pricePerItem: 10,
    description:
      "Thirty fantasy pins on one frame. Tap available pins to multi-select, then add them all to your cart.",
    image: "/images/home/ReleaseCard1.png",
    items: buildPins("board-pins-10", "Pin", 32, [5, 12, 21, 28], 0),
  },
  {
    id: "board-pins-25",
    slug: "twenty-five-dollar-collector-pin-board",
    title: "$25 Collector Pin Board",
    category: "pins",
    pricePerItem: 25,
    description:
      "Premium collector pins arranged on a single board. Select as many available pins as you like.",
    image: "/images/home/collectorCard3.png",
    items: buildPins("board-pins-25", "Pin", 30, [3, 9, 16, 24], 4),
  },
  {
    id: "board-pins-40",
    slug: "forty-dollar-limited-pin-board",
    title: "$40 Limited Pin Board",
    category: "pins",
    pricePerItem: 40,
    description:
      "Limited fantasy pins with numbered slots. Multi-select your favorites from this frame.",
    image: "/images/home/releaseCard4.png",
    items: buildPins("board-pins-40", "Pin", 36, [7, 14, 22, 31], 8),
  },
  {
    id: "board-stickers-4",
    slug: "four-dollar-postage-sticker-board",
    title: "$4 Postage Sticker Board",
    category: "stickers",
    pricePerItem: 4,
    description:
      "First-class postage stickers on one board. Pick multiple stickers in one add-to-cart.",
    image: "/images/product/product3.png",
    items: buildPins("board-stickers-4", "Sticker", 30, [], 2),
  },
  {
    id: "board-accessories-15",
    slug: "fifteen-dollar-trading-accessory-board",
    title: "$15 Trading Accessory Board",
    category: "accessories",
    pricePerItem: 15,
    description:
      "Trading accessories laid out for multi-select. Add several pieces from this frame at once.",
    image: "/images/home/collectorCard2.png",
    items: buildPins("board-accessories-15", "Acc", 30, [4, 10, 18, 25], 10),
  },
  {
    id: "board-accessories-20",
    slug: "twenty-dollar-board-kit-board",
    title: "$20 Board Kit Accessories",
    category: "accessories",
    pricePerItem: 20,
    description:
      "Board kit accessories with pin names and availability states for multi-select shopping.",
    image: "/images/home/releaseCard3.png",
    items: buildPins("board-accessories-20", "Acc", 34, [1, 8, 17, 26, 33], 12),
  },
];

export function isBoardCategory(value: string): value is BoardCategory {
  return value === "pins" || value === "stickers" || value === "accessories";
}

export function getBoardsByCategory(category: BoardCategory) {
  return boards.filter((board) => board.category === category);
}

export function getBoard(category: BoardCategory, slug: string) {
  return boards.find(
    (board) => board.category === category && board.slug === slug,
  );
}

export function getAvailableCount(board: Board) {
  return board.items.filter((item) => item.status === "available").length;
}

export function getBoardHref(board: Board) {
  if (board.grouping === "price") {
    return `/boards/price/${board.slug}`;
  }
  return `/boards/${board.category}/${board.slug}`;
}

export function getBoardItemLabel(board: Board) {
  if (board.grouping === "price") return "products";
  if (board.category === "stickers") return "stickers";
  if (board.category === "accessories") return "items";
  return "pins";
}

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
