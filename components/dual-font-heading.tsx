import type { ElementType, HTMLAttributes } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type DualFontHeadingProps = {
  children: string;
  as?: HeadingTag;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

function renderDualFontLine(text: string, keyPrefix: string) {
  return text.split(/(\s+)/).map((chunk, index) => {
    if (!chunk || /^\s+$/.test(chunk)) {
      return chunk;
    }

    const lead = chunk[0];
    const rest = chunk.slice(1);

    return (
      <span key={`${keyPrefix}-${index}`} className="dual-font-word">
        <span className="dual-font-lead">{lead}</span>
        {rest ? <span className="dual-font-rest">{rest}</span> : null}
      </span>
    );
  });
}

function renderDualFontText(text: string) {
  const lines = text.split(/\n/);

  return lines.map((line, index) => (
    <span key={`line-${index}`} className="dual-font-line">
      {index > 0 ? <br /> : null}
      {renderDualFontLine(line, `line-${index}`)}
    </span>
  ));
}

export function DualFontHeading({
  children,
  as: Tag = "h2",
  className,
  ...props
}: DualFontHeadingProps) {
  const Heading = Tag as ElementType;

  return (
    <Heading className={["dual-font-heading", className].filter(Boolean).join(" ")} {...props}>
      {renderDualFontText(children)}
    </Heading>
  );
}
