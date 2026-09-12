import {
  buildShopHref,
  type ShopSort,
} from "@/lib/shop-filters";
import Link from "next/link";

const OPTIONS: { label: string; value: ShopSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Popularity", value: "popularity" },
];

export function ShopSortBar({
  activeCollection,
  activeSub,
  activeSort,
}: {
  activeCollection?: string;
  activeSub?: string;
  activeSort: ShopSort;
}) {
  return (
    <div className="shop-sort-bar" aria-label="Sort products">
      <span className="shop-sort-label">Sort</span>
      {OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={buildShopHref({
            collection: activeCollection,
            sub: activeSub,
            sort: option.value,
          })}
          className={`shop-sort-chip${activeSort === option.value ? " is-active" : ""}`}
          aria-current={activeSort === option.value ? "page" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
