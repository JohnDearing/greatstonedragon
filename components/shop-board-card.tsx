import { Board, getAvailableCount, getBoardHref, money } from "@/lib/boards";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";

export function ShopBoardCard({ board }: { board: Board }) {
  const available = getAvailableCount(board);

  return (
    <Link
      href={getBoardHref(board)}
      className="shop-product-card"
    >
      <span className="shop-product-media">
        <ProductImage
          src={board.image}
          alt={board.title}
          width={800}
          height={800}
          sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 320px"
          className="shop-product-img"
        />
      </span>
      <span className="shop-product-shade" aria-hidden="true" />
      <em className="shop-product-badge">{available} LEFT</em>
      <strong className="shop-product-title">
        {board.title}
        <span className="shop-board-meta">
          {money(board.pricePerItem)} each · {board.items.length}{" "}
          {board.items.length === 1 ? "item" : "items"}
        </span>
      </strong>
    </Link>
  );
}
