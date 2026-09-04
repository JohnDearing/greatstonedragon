"use client";

import { useState } from "react";

type ContactHelpItem = {
  title: string;
  details: string;
};

const helpItems: ContactHelpItem[] = [
  {
    title: "General Inquiries",
    details:
      "For general inquiries, please contact support@greatstonedragon.com",
  },
  {
    title: "Fantasy Presales",
    details:
      "For fantasy presale questions, timeline updates, or preorder support, please contact presales@greatstonedragon.com",
  },
  {
    title: "Shipping Inquiries",
    details:
      "For shipping updates, delivery issues, or address changes, please contact shipping@greatstonedragon.com",
  },
];

export default function ContactHelpSection() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="w-full bg-white py-8 sm:py-10 md:py-14 lg:py-16">
      <div className="container grid gap-6 md:gap-8 lg:grid-cols-[0.78fr_1.32fr] lg:gap-10">
        <div>
          <h2 className="font-[var(--font-display)] text-4xl leading-[0.9] text-[var(--brand)] sm:text-5xl md:text-6xl">
            How Can I
            <br />
            Help?
          </h2>
        </div>

        <div>
          {helpItems.map((item, index) => {
            const isOpen = Boolean(openItems[index]);

            return (
              <div key={item.title} className="border-b border-[#ece7e7]">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-start justify-between gap-4 py-3 text-left sm:py-4"
                >
                  <span className="flex-1 pr-3 text-lg font-semibold text-[#3a3a3a] sm:text-xl md:text-2xl">
                    {item.title}
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

                {isOpen ? (
                  <p className="pb-4 pr-2 text-sm leading-relaxed text-[#737373] sm:pr-6 sm:text-base md:pr-8 md:text-lg">
                    {item.details}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
