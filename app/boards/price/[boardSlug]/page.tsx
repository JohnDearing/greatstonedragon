import { BoardFrame } from "@/components/board-frame";
import {
  getAvailableCount,
  getBoardItemLabel,
  money,
} from "@/lib/boards";
import { getPriceBoard } from "@/lib/price-board-catalog";
import { resolveBoardPinCheckoutMap } from "@/lib/board-shopify";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PriceBoardDetailPage({
  params,
}: {
  params: Promise<{ boardSlug: string }>;
}) {
  const { boardSlug } = await params;
  const catalog = await getCatalogProducts();
  const board = getPriceBoard(catalog, boardSlug);
  if (!board) notFound();

  const pinCheckoutMap = resolveBoardPinCheckoutMap(
    board.items,
    `/boards/price/${board.slug}`,
  );

  const available = getAvailableCount(board);
  const itemLabel = getBoardItemLabel(board);

  return (
    <main className="page-block boards-page board-detail-page">
      <section className="container">
        <div className="board-detail-top">
          <p>
            <Link href="/boards">All boards</Link>
            {" / "}
            <Link href="/boards/price">Price boards</Link>
          </p>
          <h1>{board.title}</h1>
          <span>
            {money(board.pricePerItem)} each · {available} available ·{" "}
            {board.items.length} total
          </span>
          <p className="board-detail-copy">
            Select from {board.items.length} products at {money(board.pricePerItem)}{" "}
            each. Multi-select your favorites, then add them all to your cart.
          </p>
          <p className="board-detail-legend">
            Available {itemLabel} show a soft pink pulse. Your picks fill with a
            check. A red ✕ means it&apos;s claimed.
          </p>
        </div>

        <BoardFrame board={board} pinCheckoutMap={pinCheckoutMap} />

        {!board.items.length ? (
          <p className="board-detail-empty muted">
            No products at {money(board.pricePerItem)} are synced yet. Check back
            soon or <Link href="/products">browse the full shop</Link>.
          </p>
        ) : null}
      </section>
    </main>
  );
}
