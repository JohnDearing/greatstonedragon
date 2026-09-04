export type ReviewCardData = {
  id: string;
  rating: number;
  body: string;
  name: string;
  product?: string;
  thumbnail?: string;
};

interface ReviewCardProps {
  review: ReviewCardData;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <path
            d="M10 1.4l2.3 4.8 5.3.7-3.8 3.6 1 5.2-4.8-2.8-4.8 2.8 1-5.2-3.8-3.6 5.3-.7L10 1.4z"
            fill={index < rating ? "#d18c00" : "#e7d6bf"}
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const firstLetter = review.name.charAt(0).toUpperCase();
  const quote = review.body.startsWith('"') ? review.body : `"${review.body}"`;

  return (
    <article className="rounded-2xl border border-[#d7a8b5] bg-white px-4 pb-4 pt-4 shadow-[0_6px_16px_rgba(111,20,33,0.06)] sm:px-5">
      <div className="flex items-center gap-2">
        <span className="font-serif text-5xl leading-none text-[var(--brand)] sm:text-6xl">
          &ldquo;
        </span>
        <Stars rating={Math.max(1, Math.min(5, review.rating || 5))} />
      </div>

      <p className="mt-2 min-h-20 text-sm italic leading-relaxed text-[#4a4a4a] sm:text-base md:text-lg">
        {quote}
      </p>

      <div className="mt-4 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white">
            {firstLetter}
          </span>
          <p className="truncate text-base font-semibold uppercase text-[#2f2f2f] sm:text-lg">
            {review.name}
          </p>
        </div>
        {review.product ? (
          <p className="mt-1 truncate text-xs text-[#767676] sm:text-sm">{review.product}</p>
        ) : null}
      </div>
    </article>
  );
}
