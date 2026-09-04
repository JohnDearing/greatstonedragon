import { BoardCard } from "@/components/board-card";
import { boardCategories } from "@/lib/boards";
import { getHydratedBoards } from "@/lib/board-catalog";
import { getPriceBoards } from "@/lib/price-board-catalog";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";

export default async function BoardsHubPage() {
  const catalog = await getCatalogProducts();
  const boards = getHydratedBoards(catalog).filter((board) => board.items.length);
  const priceBoards = getPriceBoards(catalog);
  return (
    <main className="page-block boards-page">
      <section className="container">
        <div className="section-head boards-head">
          <p>Collector Boards</p>
          <h1>Shop By Board</h1>
          <span>
            Browse pin, sticker, and accessory boards. Open a frame, multi-select
            numbered pieces by pin name, and add them to your cart together.
          </span>
        </div>

        <div className="boards-category-grid">
          <Link href="/boards/price" className="boards-category-card">
            <strong>Price Boards</strong>
            <span>All products at the same price on one frame.</span>
            <em>{priceBoards.length} board{priceBoards.length === 1 ? "" : "s"}</em>
          </Link>
          {boardCategories.map((category) => {
            const count = boards.filter(
              (board) => board.category === category.slug,
            ).length;
            return (
              <Link
                key={category.slug}
                href={`/boards/${category.slug}`}
                className="boards-category-card"
              >
                <strong>{category.label}</strong>
                <span>{category.blurb}</span>
                <em>{count} board{count === 1 ? "" : "s"}</em>
              </Link>
            );
          })}
        </div>

        {priceBoards.length ? (
          <>
            <div className="section-head boards-head">
              <h2>Shop by price</h2>
              <span>
                Pins, stickers, and accessories that share a price appear together.
              </span>
            </div>
            <div className="boards-all-grid">
              {priceBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </>
        ) : null}

        {boards.length ? (
          <>
            <div className="section-head boards-head">
              <h2>Shop by category</h2>
            </div>
            <div className="boards-all-grid">
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
