import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const token = process.env.JUDGEME_PRIVATE_TOKEN;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!token || !domain) {
    return NextResponse.json({ reviews: [], totalReviews: 0 });
  }

  try {
    const url = new URL("https://judge.me/api/v1/reviews");
    url.searchParams.set("api_token", token);
    url.searchParams.set("shop_domain", domain);
    url.searchParams.set("published", "true");
    url.searchParams.set("per_page", "250");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ reviews: [], totalReviews: 0 });

    const data = await res.json();
    const reviews = (data.reviews ?? []).map(
      (r: {
        rating: number;
        title?: string;
        body: string;
        reviewer: { name?: string };
        product_title?: string;
      }) => ({
        rating: r.rating,
        title: r.title ?? "",
        body: r.body,
        name: r.reviewer?.name ?? "Collector",
        product: r.product_title ?? "",
      }),
    );

    const totalReviews = Number(
      data.total ??
        data.total_count ??
        data.reviews_count ??
        data.count ??
        reviews.length,
    );

    return NextResponse.json({ reviews, totalReviews });
  } catch {
    return NextResponse.json({ reviews: [], totalReviews: 0 });
  }
}
