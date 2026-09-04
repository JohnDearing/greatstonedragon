"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const trustLogos = [
  "/images/review/logo1.png",
  "/images/review/logo2.png",
  "/images/review/logo3.png",
  "/images/review/logo4.png",
  "/images/review/logo5.png",
  "/images/review/logo6.png",
];

export default function ReviewTrustSlider() {
  const marqueeLogos = [...trustLogos, ...trustLogos];
  const [reviewCount, setReviewCount] = useState(255);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data: { reviews?: unknown[]; totalReviews?: number }) => {
        if (!isMounted) return;
        const count =
          (typeof data.totalReviews === "number" && data.totalReviews > 0
            ? data.totalReviews
            : data.reviews?.length) ?? 0;
        if (count > 0) {
          setReviewCount(count);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-white pb-14 pt-2 sm:pb-16 sm:pt-4 md:pb-20">
      <div className="container">
        <div className="text-center">
          <p className="text-base font-semibold text-[#0f8a8b] sm:text-lg md:text-xl">
            ★★★★★ <span className="ml-2">{reviewCount} reviews</span>
          </p>
          <p className="mt-2 text-base font-semibold text-[#0f8a8b] sm:text-lg md:text-xl">
            Verified by <span className="font-bold">Judge.me</span>{" "}
            <span className="text-[#4e6f75]">REVIEWS</span>
          </p>
        </div>

        <div className="trust-slider mt-6 sm:mt-8">
          <div className="trust-track">
            {marqueeLogos.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="trust-item h-[115px] w-[115px] sm:h-[145px] sm:w-[145px] md:h-[190px] md:w-[190px]"
              >
                <Image
                  src={src}
                  alt="Judge.me trust badge"
                  width={190}
                  height={190}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
