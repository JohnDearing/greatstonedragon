"use client";

import { useEffect, useMemo, useState } from "react";
import ReviewCard, { ReviewCardData } from "@/components/review-card";

const FALLBACK_REVIEWS: ReviewCardData[] = [
  {
    id: "fallback-1",
    rating: 5,
    body: "Amazing pin beautiful, well made pin. Great design.",
    name: "Lisa Boardman",
    product: "Fantasy Collector Pin",
  },
  {
    id: "fallback-2",
    rating: 5,
    body: "I just love how detail oriented the pin is, it's so sparkly and I love that mochi is included in the pin.",
    name: "Diane Dau",
    product: "Dorlables Series",
  },
  {
    id: "fallback-3",
    rating: 5,
    body: "Just got my first fantasy pins. I got the EPCOT series and those pins are beautiful.",
    name: "Mike Holguin",
    product: "Epcot Series",
  },
  {
    id: "fallback-4",
    rating: 5,
    body: "Amazing pin beautiful, well made pin. Great design.",
    name: "Lisa Boardman",
    product: "Fantasy Collector Pin",
  },
  {
    id: "fallback-5",
    rating: 5,
    body: "I just love how detail oriented the pin is, it's so sparkly and I love that mochi is included in the pin.",
    name: "Diane Dau",
    product: "Dorlables Series",
  },
  {
    id: "fallback-6",
    rating: 5,
    body: "Just got my first fantasy pins. I got the EPCOT series and those pins are beautiful.",
    name: "Mike Holguin",
    product: "Epcot Series",
  },
];

type ApiReview = {
  rating: number;
  body: string;
  name: string;
  product?: string;
  title?: string;
};

const INITIAL_VISIBLE_COUNT = 9;

export default function ReviewsGridSection() {
  const [reviews, setReviews] = useState<ReviewCardData[]>(FALLBACK_REVIEWS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data: { reviews?: ApiReview[] }) => {
        if (!isMounted || !data.reviews?.length) return;

        const mapped = data.reviews.map((item, index) => ({
          id: `api-${index}-${item.name}`,
          rating: item.rating || 5,
          body: item.body || item.title || "Love this shop and the quality!",
          name: item.name || "Collector",
          product: item.product || "",
        }));

        if (mapped.length) {
          setReviews(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const cardsToRender = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  );

  const canShowMore = visibleCount < reviews.length;
  const canShowLess = visibleCount > INITIAL_VISIBLE_COUNT;

  return (
    <section className="w-full bg-white pb-14 pt-8 sm:pb-16 sm:pt-10 md:pb-20 md:pt-14">
      <div className="container">
        <h2 className="text-center font-[var(--font-display)] text-5xl leading-[0.95] text-[var(--brand)] sm:text-6xl md:text-7xl">
          Testimonials From
          <br />
          Customers
        </h2>

        <div className="mt-6 grid gap-4 sm:mt-8 md:mt-10 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {cardsToRender.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {canShowMore || canShowLess ? (
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {canShowMore ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)] px-4 py-2 text-base font-semibold text-[var(--brand)] transition-opacity hover:opacity-80 sm:text-lg md:text-xl"
                >
                  Show More
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : null}

              {canShowLess ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount(INITIAL_VISIBLE_COUNT)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)] px-4 py-2 text-base font-semibold text-[var(--brand)] transition-opacity hover:opacity-80 sm:text-lg md:text-xl"
                >
                  Show Less
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
