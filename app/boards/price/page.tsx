import { BoardCard } from "@/components/board-card";
import { getPriceBoards } from "@/lib/price-board-catalog";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";

export default async function PriceBoardsPage() {
  const catalog = await getCatalogProducts();
  const boards = getPriceBoards(catalog);

  return (
    <main className="page-block boards-page">
      <section className="container">
        <div className="section-head boards-head">
          <p>
            <Link href="/boards">All boards</Link> / Shop by price
          </p>
          <h1>Price Boards</h1>
          <span>
            Every product at the same price on one frame. Mix pins, stickers, and
            accessories when they share a price point.
          </span>
        </div>

        <div className="boards-all-grid">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>

        {!boards.length ? (
          <p className="muted">No price boards are available yet.</p>
        ) : null}
      </section>
    </main>
  );
}
