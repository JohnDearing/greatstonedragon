"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import type {
  PolicyBlock,
  PolicyDocument,
  PolicyInline,
  PolicySection,
} from "@/lib/policies";
import Link from "next/link";
import { Fragment, useLayoutEffect, useMemo, useRef } from "react";

const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Shipping Policy", href: "/shipping" },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderInline(part: PolicyInline, key: number) {
  if (typeof part === "string") {
    return <Fragment key={key}>{part}</Fragment>;
  }

  const external =
    part.external ??
    (part.href.startsWith("http") || part.href.startsWith("mailto:"));

  if (part.href.startsWith("/")) {
    return (
      <Link key={key} href={part.href} className="policy-link">
        {part.text}
      </Link>
    );
  }

  return (
    <a
      key={key}
      href={part.href}
      className="policy-link"
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {part.text}
    </a>
  );
}

function renderBlock(block: PolicyBlock, key: number) {
  if (block.type === "paragraph") {
    return (
      <p key={key} className="policy-paragraph">
        {block.content.map((part, index) => renderInline(part, index))}
      </p>
    );
  }

  if (block.type === "list") {
    return (
      <ul key={key} className="policy-list">
        {block.items.map((item, index) => (
          <li key={index}>
            {item.map((part, partIndex) => renderInline(part, partIndex))}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div key={key} className="policy-table-wrap">
      <table className="policy-table">
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} data-label={block.headers[cellIndex]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicySectionBlock({
  section,
  depth = 0,
  sectionId,
}: {
  section: PolicySection;
  depth?: number;
  sectionId: string;
}) {
  const HeadingTag = depth === 0 ? "h2" : "h3";

  return (
    <section
      id={depth === 0 ? sectionId : undefined}
      className="policy-section"
      data-depth={depth}
    >
      <HeadingTag className="policy-section-title">{section.title}</HeadingTag>
      {section.blocks?.map((block, index) => renderBlock(block, index))}
      {section.subsections?.map((subsection) => (
        <PolicySectionBlock
          key={subsection.title}
          section={subsection}
          depth={depth + 1}
          sectionId={slugify(subsection.title)}
        />
      ))}
    </section>
  );
}

export function PolicyPage({ document }: { document: PolicyDocument }) {
  const pageRef = useRef<HTMLElement>(null);

  const toc = useMemo(
    () =>
      document.sections.map((section) => ({
        id: slugify(section.title),
        title: section.title,
      })),
    [document.sections],
  );

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || prefersReducedMotion()) return;

    const { gsap, SplitText } = registerGsap();
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      const kicker = page.querySelector(".policy-kicker");
      const heading = page.querySelector(".policy-hero h1");
      const lead = page.querySelector(".policy-lead");
      const updated = page.querySelector(".policy-updated");
      const sections = gsap.utils.toArray<HTMLElement>(
        page.querySelectorAll(".policy-section[data-depth='0']"),
      );

      if (!heading) return;

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        linesClass: "policy-split-line",
        wordsClass: "policy-split-word",
      });
      splits.push(headingSplit);

      gsap.set(headingSplit.lines, { overflow: "hidden", display: "block" });
      gsap.set(headingSplit.words, {
        display: "inline-block",
        yPercent: 115,
        autoAlpha: 0,
        rotate: 3,
        transformOrigin: "50% 100%",
      });

      if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 16 });
      if (updated) gsap.set(updated, { autoAlpha: 0, y: 14 });
      if (lead) gsap.set(lead, { autoAlpha: 0, y: 22 });
      gsap.set(sections, { autoAlpha: 0, y: 28 });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: page.querySelector(".policy-hero"),
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      if (kicker) {
        introTl.to(kicker, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        });
      }

      introTl.to(
        headingSplit.words,
        {
          yPercent: 0,
          autoAlpha: 1,
          rotate: 0,
          duration: 0.85,
          stagger: 0.06,
          ease: "power3.out",
        },
        kicker ? "-=0.25" : 0,
      );

      if (updated) {
        introTl.to(
          updated,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.45",
        );
      }

      if (lead) {
        introTl.to(
          lead,
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.35",
        );
      }

      sections.forEach((section) => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, page);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [document.title]);

  return (
    <main className="policy-page" ref={pageRef}>
      <header className="policy-hero">
        <div className="container policy-hero-inner">
          <p className="policy-kicker">Legal</p>
          <h1>{document.title}</h1>
          <p className="policy-updated">Last updated: {document.lastUpdated}</p>
          {document.lead ? (
            <p className="policy-lead">{document.lead}</p>
          ) : null}
        </div>
      </header>

      <div className="container policy-layout">
        <aside className="policy-aside" aria-label="Policy navigation">
          <nav className="policy-toc" aria-label="On this page">
            <h2 className="policy-aside-title">On this page</h2>
            <ol>
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <nav className="policy-related" aria-label="Related policies">
            <h2 className="policy-aside-title">Policies</h2>
            <ul>
              {POLICY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={
                      item.label === document.title ? "page" : undefined
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="policy-body">
          {document.sections.map((section) => (
            <PolicySectionBlock
              key={section.title}
              section={section}
              sectionId={slugify(section.title)}
            />
          ))}

          <footer className="policy-endnote">
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:support@greatstonedragon.com">
                support@greatstonedragon.com
              </a>
              .
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
