import { descriptionToHtml } from "@/lib/shopify";

export function ProductDescription({
  html,
  text,
}: {
  html?: string;
  text: string;
}) {
  const markup = descriptionToHtml(html, text);
  if (!markup) return null;

  return (
    <div
      className="prose product-copy max-w-none"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
