import { p, type PolicyDocument, ul } from "./types";

export const termsOfService: PolicyDocument = {
  title: "Terms of Service",
  lastUpdated: "June 24, 2026",
  lead: "Welcome to Great Stone Dragon. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. If you do not agree with these terms, please do not use this website.",
  sections: [
    {
      title: "1. Website Use",
      blocks: [
        p(
          "By using this website, you agree to use it only for lawful purposes. You may not use the site in any way that could damage, disable, or interfere with the operation of the website or negatively impact other users.",
        ),
      ],
    },
    {
      title: "2. Products and Orders",
      blocks: [
        p(
          "All products are subject to availability and may be limited in quantity. Great Stone Dragon reserves the right to modify, discontinue, or limit products at any time without prior notice.",
        ),
        p("By placing an order, you confirm that:"),
        ul(
          ["All information provided is accurate and complete"],
          ["You are authorized to use the selected payment method"],
          [
            "You understand that preorder fantasy pin items are subject to production, shipping, and manufacturing timelines that may range from 3 to 6 months or longer depending on manufacturer timelines and production volume",
          ],
          [
            "You understand that estimated timelines are not guaranteed and may change due to manufacturer delays, shipping carrier delays, customs processing, or production issues outside of our control",
          ],
        ),
      ],
    },
    {
      title: "3. Pin Grading Policy",
      blocks: [
        p(
          "All fantasy pins sold by Great Stone Dragon are handmade enamel pins. Due to the nature of the manufacturing process, minor imperfections may occur and are considered normal.",
        ),
        p(
          "By purchasing from Great Stone Dragon, you acknowledge that you have read and agreed to this grading policy.",
        ),
        p(
          "Pins are graded based on the overall quality of the production batch. If a particular flaw is consistently present throughout the entire batch, such as a small pin prick or other minor manufacturing imperfection, that flaw may still be considered part of the standard production quality and may be present across multiple grades.",
        ),
      ],
      subsections: [
        {
          title: "Presale Grade",
          blocks: [
            p(
              "Presale Grade pins are the highest quality pins selected from the batch. While these are the best available pins, they are not guaranteed to be flawless and may still contain minor imperfections.",
            ),
          ],
        },
        {
          title: "Standard Grade",
          blocks: [
            p(
              "Standard Grade pins are the second-highest quality grade after Presale Grade. These pins may include minor flaws such as:",
            ),
            ul(
              ["Pin pricks"],
              ["Light underfill or overfill"],
              ["Light plating scratches"],
              ["Light polishing scratches"],
              ["Minor print misalignment"],
            ),
            p(
              "These flaws are generally not noticeable when viewed at arm's length.",
            ),
          ],
        },
        {
          title: "Minor Flaw Grade",
          blocks: [
            p("Minor Flaw pins may include:"),
            ul(
              ["Pin pricks"],
              ["Plating scratches"],
              ["Polishing scratches"],
              ["Underfill"],
              ["Overfill"],
              ["Print misalignment"],
            ),
            p(
              "These flaws may be noticeable when viewed at arm's length but do not significantly impact the overall appearance of the pin.",
            ),
          ],
        },
        {
          title: "Major Flaw Grade",
          blocks: [
            p(
              "Major Flaw pins contain the same types of imperfections listed above, but the flaws are more pronounced and readily visible when viewed at arm's length.",
            ),
          ],
        },
        {
          title: "Grading Standards",
          blocks: [
            p("All pins are graded under natural lighting conditions."),
            p(
              "Pins are evaluated from an arm's-length viewing distance and are not tilted, magnified, zoomed in on, or inspected under specialized lighting for the purpose of identifying flaws.",
            ),
            p(
              "Grading is based on the overall appearance of the pin under normal viewing conditions.",
            ),
          ],
        },
      ],
    },
    {
      title: "4. Pricing and Promotions",
      blocks: [
        p(
          "All prices are listed in U.S. Dollars (USD) and are subject to change without notice. Promotions, discounts, bundle offers, and limited releases are available while supplies last and may be modified or discontinued at any time.",
        ),
      ],
    },
    {
      title: "5. Shipping and Delivery",
      blocks: [
        p(
          "We currently ship within the United States and to select international locations.",
        ),
        p(
          "Customers are responsible for providing a complete and accurate shipping address at checkout. Great Stone Dragon is not responsible for packages that are delayed, lost, stolen, or misdelivered due to incorrect shipping information.",
        ),
        p(
          "Once a package has been marked as delivered by the shipping carrier, responsibility for the package transfers to the customer.",
        ),
      ],
      subsections: [
        {
          title: "Shipping Timelines",
          blocks: [
            p("Shipping timelines vary depending on the type of item purchased:"),
            p(
              "In Hand Items: ",
              "Typically ship within 24 to 48 hours after purchase.",
            ),
            p(
              "Fantasy Pin Presales: ",
              "Production and fulfillment timelines typically range from 3 to 6 months depending on manufacturer timelines and production volume.",
            ),
            p(
              "Employee Exclusive / Cast Member Presales: ",
              "These items must first be shipped from Disney to our pickup contact before being forwarded to Great Stone Dragon for fulfillment. Estimated turnaround time is approximately 2 to 4 weeks.",
            ),
            p(
              "Disneyland Paris Presales: ",
              "Paris pickup orders are typically grouped and shipped at the beginning of the month following the release month in order to consolidate releases and reduce international shipping costs. Delivery timelines may vary depending on release schedules and international transit times.",
            ),
            p(
              "Orders containing both in hand items and preorder or presale items may be held and shipped together once all items are available unless otherwise stated.",
            ),
          ],
        },
      ],
    },
    {
      title: "6. Refunds and Returns",
      blocks: [
        p("All sales are final."),
        p(
          "Refunds, cancellations, returns, exchanges, or replacements will only be considered if an item cannot be fulfilled or becomes unavailable.",
        ),
        p(
          "Due to the handmade nature of enamel pins, minor imperfections that fall within the grading standards outlined above do not qualify for refunds, returns, exchanges, replacements, chargebacks, or disputes.",
        ),
        p(
          "Due to the made-to-order nature of many preorder and fantasy pin items, manufacturing delays, shipping delays, customs delays, or production timeline changes do not qualify for refunds.",
        ),
        p("Please refer to our Refund and Return Policy for additional details."),
      ],
    },
    {
      title: "7. Social Media and Customer Content",
      blocks: [
        p(
          "By tagging, sharing, or submitting photos, reviews, comments, or feedback related to Great Stone Dragon products or services, you grant permission for Great Stone Dragon to repost, share, or use that content for promotional and marketing purposes unless otherwise requested.",
        ),
      ],
    },
    {
      title: "8. Account Responsibility",
      blocks: [
        p(
          "If you create an account on our website, you are responsible for maintaining the confidentiality of your account information and password, as well as all activity conducted under your account.",
        ),
      ],
    },
    {
      title: "9. Changes to These Terms",
      blocks: [
        p(
          "Great Stone Dragon reserves the right to update or modify these Terms of Service at any time without prior notice. Changes will become effective immediately upon posting to this page. Continued use of the website after updates constitutes acceptance of the revised terms.",
        ),
      ],
    },
    {
      title: "10. Contact Information",
      blocks: [
        p(
          "If you have any questions regarding these Terms of Service, please contact us at ",
          { text: "support@greatstonedragon.com", href: "mailto:support@greatstonedragon.com" },
          ".",
        ),
      ],
    },
  ],
};
