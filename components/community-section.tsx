"use client";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap-client";
import { socialLinks } from "@/lib/social-links";
import { useLayoutEffect, useRef } from "react";

export function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const { gsap, SplitText } = registerGsap();
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      const kicker = section.querySelector(".community-kicker");
      const heading = section.querySelector(".community-left h2");
      const leftCopy = section.querySelector(".community-left-copy");
      const ctaRow = section.querySelector(".community-cta-row");
      const rightCopy = section.querySelector(".community-right-copy");
      const items = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".community-item"),
      );

      if (!heading) return;

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        linesClass: "community-split-line",
        wordsClass: "community-split-word",
      });
      splits.push(headingSplit);

      let rightSplit: InstanceType<typeof SplitText> | null = null;
      if (rightCopy) {
        rightSplit = SplitText.create(rightCopy, {
          type: "words,lines",
          linesClass: "community-split-line",
          wordsClass: "community-split-word",
        });
        splits.push(rightSplit);
      }

      gsap.set(headingSplit.lines, { overflow: "hidden", display: "block" });
      gsap.set(headingSplit.words, {
        display: "inline-block",
        yPercent: 115,
        autoAlpha: 0,
        rotate: 4,
        transformOrigin: "50% 100%",
      });

      if (rightSplit) {
        gsap.set(rightSplit.lines, { overflow: "hidden", display: "block" });
        gsap.set(rightSplit.words, {
          display: "inline-block",
          yPercent: 100,
          autoAlpha: 0,
        });
      }

      gsap.set(kicker, { autoAlpha: 0, y: 18 });
      gsap.set(leftCopy, { autoAlpha: 0, y: 22 });
      gsap.set(ctaRow, { autoAlpha: 0, y: 24 });
      gsap.set(items, { autoAlpha: 0, x: 36 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          end: "top 18%",
          scrub: 1.2,
        },
      });

      tl.to(kicker, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "none",
      })
        .to(
          headingSplit.words,
          {
            yPercent: 0,
            autoAlpha: 1,
            rotate: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: "none",
          },
          0.15,
        )
        .to(
          leftCopy,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "none",
          },
          0.55,
        )
        .to(
          ctaRow,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "none",
          },
          0.75,
        );

      if (rightSplit) {
        tl.to(
          rightSplit.words,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.035,
            ease: "none",
          },
          0.4,
        );
      }

      items.forEach((item, index) => {
        tl.to(
          item,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.85,
            ease: "none",
          },
          0.85 + index * 0.28,
        );
      });
    }, section);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-block community-section"
      id="community"
    >
      <div className="container community-block">
        <div className="community-left">
          <p className="community-kicker">COMMUNITY</p>
          <h2>Join Our Collector Community</h2>
          <p className="muted community-left-copy">
            Connect with fellow collectors, share finds, and get early drop
            alerts.
          </p>

          <div className="community-cta-row">
            <a
              className="cta-button"
              href={socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Our Discord
            </a>
            <span className="community-count">2,000+ collectors</span>
          </div>
        </div>

        <div className="community-right">
          <p className="community-right-copy">
            Connect With Fellow Collectors, Share Your Latest Finds, Get Sneak
            Peeks Of Upcoming Releases, And Stay Up To Date On All Things Great
            Stone Dragon Through Our Discord Community.
          </p>

          <div className="community-right-points">
            <div className="community-item">
              <span className="community-icon">
                <BellIcon />
              </span>
              <div>
                <strong>First To Know</strong>
                <span>
                  Get Sneak Peeks Of Upcoming Drops Before Everyone Else.
                </span>
              </div>
            </div>

            <div className="community-item">
              <span className="community-icon">
                <ChatIcon />
              </span>
              <div>
                <strong>Collector Chat</strong>
                <span>
                  Share Finds, Trade Tips, And Connect With Fellow Collectors.
                </span>
              </div>
            </div>

            <div className="community-item">
              <span className="community-icon">
                <GiftIcon />
              </span>
              <div>
                <strong>Exclusive Events</strong>
                <span>
                  Member-Only Giveaways, Challenges, And Limited Drops.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 22a2.3 2.3 0 0 0 2.3-2.3H9.7A2.3 2.3 0 0 0 12 22Z"
        fill="currentColor"
      />
      <path
        d="M18 16.7V11.2c0-3.4-2.5-6-6-6s-6 2.6-6 6v5.5l-1.6 1.6v.9h16.2v-.9L18 16.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.8 17.2 6 20.2l3-1.2c1.1.4 2.3.7 3.6.7 5.1 0 9-3.2 9-7.2S17.7 5.3 12.6 5.3s-9 3.2-9 7.2c0 1.7.7 3.3 2.2 4.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M3.5 11h17v10.2H3.5V11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v10.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M2.7 7.7h18.6v3.3H2.7V7.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.7c-2.2-3.4 0-5.2 1.8-5.2 2 0 3.2 2.2 1.6 5.2H12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.7C9.8 4.3 12 2.5 13.8 2.5c2 0 3.2 2.2 1.6 5.2H12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        transform="scale(-1,1) translate(-24,0)"
      />
    </svg>
  );
}
