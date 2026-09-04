"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  title: string;
  items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "When will my order ship?",
        answer:
          "In-stock orders ship within 48 hours of purchase. Mixed orders containing both in-stock and preorder items will wait until all items are in hand. International presale timelines vary: Paris pins ship at the start of the following month; Asia pins typically arrive within 3 weeks; fantasy presales ship once manufacturing is complete.",
      },
      {
        question: "How are pins protected during shipping?",
        answer:
          "All orders are packed in protective sleeves, bubble wrap, and sturdy mailers to keep your collectibles safe in transit.",
      },
    ],
  },
  {
    title: "Fantasy Pins & Preorders",
    items: [
      {
        question: "How do I preorder a fantasy pin?",
        answer:
          "Once the artwork is revealed and a presale date is announced via Instagram and email, you can purchase through the Fantasy tab on the website. Presales are paid in full upfront, which covers manufacturing costs.",
      },
      {
        question: "How do I track my preorder progress?",
        answer:
          "Preorder updates are posted through email and social channels as each production milestone is completed.",
      },
      {
        question: "What does the fantasy pin manufacturing process involve?",
        answer:
          "Each pin goes through revisions, mold setup, plating, enamel fill, polish, quality checks, and final packaging before shipment.",
      },
      {
        question: "What if my preorder cannot be fulfilled?",
        answer:
          "If a preorder cannot be completed, you will receive a full refund to your original payment method.",
      },
      {
        question: "How can I suggest a future pin design?",
        answer:
          "You can send suggestions through direct messages or the contact page. Community requests help guide future concepts.",
      },
    ],
  },
  {
    title: "Orders & Returns",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Visa, Mastercard, American Express, Discover, Diners Club, PayPal, Apple Pay, Google Pay, Shop Pay, Amazon Pay, Bancontact, iDEAL Wero, and more. See the checkout page for your region's available options.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, international shipping is available. Rates and delivery estimates are calculated at checkout based on destination.",
      },
    ],
  },
];

export default function FaqsSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true,
    "1-0": true,
    "2-0": true,
  });

  const toggleItem = (groupIndex: number, itemIndex: number) => {
    const key = `${groupIndex}-${itemIndex}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className="w-full bg-white py-8 sm:py-10 md:py-14 lg:py-16">
      <div className="container space-y-8 sm:space-y-10 md:space-y-14">
        {faqGroups.map((group, groupIndex) => (
          <div
            key={group.title}
            className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[0.9fr_1.35fr]"
          >
            <h2 className="font-[var(--font-display)] text-4xl leading-[0.95] text-[var(--brand)] sm:text-5xl md:text-6xl">
              {group.title}
            </h2>

            <div>
              {group.items.map((item, itemIndex) => {
                const key = `${groupIndex}-${itemIndex}`;
                const isOpen = Boolean(openItems[key]);

                return (
                  <div key={item.question} className="border-b border-[#f0e6e9]">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 py-3 text-left sm:py-4"
                      onClick={() => toggleItem(groupIndex, itemIndex)}
                    >
                      <span className="flex-1 pr-3 text-lg font-semibold leading-tight text-[#2f2f2f] sm:text-xl md:text-2xl">
                        {item.question}
                      </span>
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--brand)]">
                        <svg
                          viewBox="0 0 24 24"
                          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <p className="pb-4 pr-2 text-sm leading-relaxed text-[#565656] sm:pr-6 sm:text-base md:pr-8 md:text-lg">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
