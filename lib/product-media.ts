import type { Product, ProductMedia } from "@/lib/store-data";

function youtubeEmbed(url: string) {
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export function productGalleryMedia(product: Product): ProductMedia[] {
  if (product.media?.length) return product.media;
  if (product.images?.length) {
    return product.images.map((url) => ({ type: "image" as const, url }));
  }
  if (product.image) return [{ type: "image", url: product.image }];
  return [];
}

export function externalVideoSrc(url: string) {
  if (url.includes("vimeo.com") && !url.includes("player.vimeo.com")) {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
    if (id) return `https://player.vimeo.com/video/${id}`;
  }
  return youtubeEmbed(url);
}
