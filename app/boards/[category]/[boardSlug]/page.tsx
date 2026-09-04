import { BoardFrame } from "@/components/board-frame";
import {
  getAvailableCount,
  isBoardCategory,
  money,
} from "@/lib/boards";
import { getHydratedBoard } from "@/lib/board-catalog";
import { resolveBoardPinCheckoutMap } from "@/lib/board-shopify";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ category: string; boardSlug: string }>;
}) {
  const { category, boardSlug } = await params;
  if (!isBoardCategory(category)) notFound();

  const catalog = await getCatalogProducts();
  const board = getHydratedBoard(catalog, category, boardSlug);
  if (!board) notFound();

  const pinCheckoutMap = resolveBoardPinCheckoutMap(
    board.items,
    `/boards/${board.category}/${board.slug}`,
  );

  const available = getAvailableCount(board);

  return (
    <main className="page-block boards-page board-detail-page">
      <section className="container">
        <div className="board-detail-top">
          <p>
            <Link href="/boards">All boards</Link>
            {" / "}
            <Link href={`/boards/${board.category}`}>
              {board.category === "pins"
                ? "Pin Boards"
                : board.category === "stickers"
                  ? "Sticker Boards"
                  : "Accessory Boards"}
            </Link>
          </p>
          <h1>{board.title}</h1>
          <span>
            {money(board.pricePerItem)} each · {available} available ·{" "}
            {board.items.length} total
          </span>
          <p className="board-detail-copy">
            {board.items.some((item) => item.variantId)
              ? `Select from ${board.items.length} products at ${money(board.pricePerItem)} each. Multi-select your favorites, then add them all to your cart.`
              : board.description}
          </p>
          <p className="board-detail-legend">
            Available {board.category === "stickers" ? "stickers" : board.category === "accessories" ? "items" : "pins"} show a soft pink pulse. Your picks fill with a check.
            A red ✕ means it&apos;s claimed.
          </p>
        </div>

        <BoardFrame
          board={board}
          pinCheckoutMap={pinCheckoutMap}
        />

        {!board.items.length ? (
          <p className="board-detail-empty muted">
            No products at {money(board.pricePerItem)} in this category are
            synced yet. Check back soon or{" "}
            <Link href="/products">browse the full shop</Link>.
          </p>
        ) : null}
      </section>
    </main>
  );
}
