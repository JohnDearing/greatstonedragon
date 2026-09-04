import { BoardCard } from "@/components/board-card";
import {
  boardCategories,
  isBoardCategory,
} from "@/lib/boards";
import { getHydratedBoardsByCategory } from "@/lib/board-catalog";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BoardCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isBoardCategory(category)) notFound();

  const catalog = await getCatalogProducts();
  const meta = boardCategories.find((item) => item.slug === category);
  const list = getHydratedBoardsByCategory(catalog, category).filter(
    (board) => board.items.length,
  );

  return (
    <main className="page-block boards-page">
      <section className="container">
        <div className="section-head boards-head">
          <p>
            <Link href="/boards">All boards</Link> / {meta?.label}
          </p>
          <h1>{meta?.label}</h1>
          <span>{meta?.blurb}</span>
        </div>

        <div className="boards-category-tabs">
          {boardCategories.map((item) => (
            <Link
              key={item.slug}
              href={`/boards/${item.slug}`}
              className={`boards-tab${item.slug === category ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="boards-all-grid">
          {list.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </section>
    </main>
  );
}
