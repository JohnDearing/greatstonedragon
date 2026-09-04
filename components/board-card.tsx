import {
  Board,
  getAvailableCount,
  getBoardHref,
  getBoardItemLabel,
  money,
} from "@/lib/boards";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";

export function BoardCard({ board }: { board: Board }) {
  const available = getAvailableCount(board);
  const itemLabel = getBoardItemLabel(board);

  return (
    <Link href={getBoardHref(board)} className="board-card">
      <span className="board-card-media">
        <ProductImage
          src={board.image}
          alt={board.title}
          fill
          sizes="(max-width: 760px) 90vw, 360px"
          className="board-card-img"
        />
        <em className="board-card-stock">{available} left</em>
      </span>
      <span className="board-card-body">
        <strong>{board.title}</strong>
        <span>
          {money(board.pricePerItem)} each · {board.items.length}{" "}
          {board.items.length === 1 ? itemLabel.slice(0, -1) || "item" : itemLabel}
        </span>
        <small>
          {board.grouping === "price"
            ? "All products at this price"
            : `Priced per ${itemLabel.slice(0, -1) || "item"}`}
        </small>
      </span>
    </Link>
  );
}
