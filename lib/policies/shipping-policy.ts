import { p, type PolicyDocument, ul } from "./types";

export const shippingPolicy: PolicyDocument = {
  title: "Shipping Policy",
  lastUpdated: "July 13, 2026",
  lead: "Thank you for shopping with Great Stone Dragon! Please review the following shipping policy before placing your order.",
  sections: [
    {
      title: "Order Processing",
      subsections: [
        {
          title: "In Hand Items",
          blocks: [
            p(
              "Orders containing only in hand items typically ship within ",
              "24–48 business hours",
              " of purchase.",
            ),
          ],
        },
        {
          title: "Fantasy Presales",
          blocks: [
            p(
              "Fantasy pin presales are made to order and are estimated to arrive ",
              "3–6 months",
              " after the presale closes, depending on manufacturing schedules, factory holidays, quality control, customs, and shipping.",
            ),
            p(
              "Production does not begin until the presale has ended. While we strive to meet all estimated timelines, these are estimates only and may change due to circumstances outside of our control.",
            ),
            p(
              "Once your pins arrive, each order is individually quality checked before being packed and shipped.",
            ),
          ],
        },
        {
          title: "Asia Preorders",
          blocks: [
            p(
              "Asia preorder windows open periodically throughout the year for a limited time.",
            ),
            p(
              "After preorders close, the order is submitted to our sourcing partner in Asia. These items are estimated to arrive within ",
              "3–6 weeks",
              ", depending on sourcing, customs, and international shipping.",
            ),
          ],
        },
        {
          title: "Disney Employee Exclusive Pickups",
          blocks: [
            p(
              "Employee exclusive pickups are first shipped from Disney to our pickup partner in Florida before being forwarded to us in California. These orders typically arrive within ",
              "2–4 weeks",
              ", depending on Disney's fulfillment schedule and transit times.",
            ),
          ],
        },
        {
          title: "Disneyland Paris Preorders",
          blocks: [
            p(
              "Disneyland Paris pickups are completed throughout the release month. Orders are shipped from Paris to us at the beginning of the following month after all scheduled releases have occurred.",
            ),
            p(
              "Once received, orders are typically shipped within ",
              "24–48 business hours",
              " after passing quality inspection.",
            ),
          ],
        },
      ],
    },
    {
      title: "Combined Orders",
      blocks: [
        p(
          "If your order contains both ",
          "in hand items",
          " and ",
          "presale/preorder items",
          ", your entire order will ship together once ",
          "all items are in hand",
          ".",
        ),
        p(
          "If you would like in hand items sooner, please place separate orders.",
        ),
      ],
    },
    {
      title: "Shipping Rates",
      blocks: [
        p(
          "Shipping costs are calculated automatically at checkout based on your shipping destination, package weight, and carrier rates.",
        ),
        p(
          "International customers are responsible for any applicable customs duties, import taxes, VAT, or other fees imposed by their country.",
        ),
      ],
    },
    {
      title: "Delivery",
      blocks: [
        p(
          "Once your package has been transferred to the shipping carrier, delivery times are outside of our control.",
        ),
        p("Tracking information will be emailed once your order ships."),
        p(
          "Great Stone Dragon is not responsible for carrier delays caused by weather, customs processing, holidays, labor disruptions, or other events beyond our control.",
        ),
      ],
    },
    {
      title: "Lost, Damaged, or Delivered Packages",
      blocks: [
        p(
          "If your package arrives damaged or appears to be lost in transit, please contact us as soon as possible at ",
          { text: "shipping@greatstonedragon.com", href: "mailto:shipping@greatstonedragon.com" },
          ".",
        ),
        p(
          "While we cannot guarantee replacement or reimbursement for carrier-related issues, we will gladly assist you in filing claims or locating your package whenever possible.",
        ),
        p(
          "Packages marked as ",
          "Delivered",
          " by the carrier are considered successfully delivered. Great Stone Dragon is not responsible for stolen packages or packages delivered to an incorrect location due to an address provided by the customer.",
        ),
      ],
    },
    {
      title: "Address Changes",
      blocks: [
        p(
          "Please verify your shipping address before completing your purchase.",
        ),
        p(
          "If you need to update your address, contact us immediately. We can only make changes before your shipping label has been created.",
        ),
        p(
          "Orders returned due to an incorrect or insufficient address provided by the customer will require additional shipping charges before they can be reshipped.",
        ),
      ],
    },
    {
      title: "Questions",
      blocks: [
        p(
          "If you have any questions regarding your order or our shipping policies, please contact us at ",
          { text: "support@greatstonedragon.com", href: "mailto:support@greatstonedragon.com" },
          ". We're always happy to help.",
        ),
      ],
    },
  ],
};
