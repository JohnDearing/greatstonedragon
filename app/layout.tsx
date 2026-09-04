import type { Metadata } from "next";
import localFont from "next/font/local";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CartProvider } from "@/components/cart-provider";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { StoreToaster } from "@/components/store-toaster";
import "./globals.css";

const raleway = localFont({
  src: "../public/fonts/Raleway-VariableFont_wght.ttf",
  variable: "--font-primary",
  display: "swap",
  weight: "100 900",
});

const montserrat = localFont({
  src: "../public/fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Great Stone Dragon | Fantasy Pins",
  description:
    "Collectible fantasy pins designed by a collector, for collectors.",
  icons: {
    icon: [{ url: "/images/fav_icon.png", type: "image/png" }],
    apple: [{ url: "/images/fav_icon.png" }],
    shortcut: ["/images/fav_icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${raleway.variable} ${montserrat.variable}`}
      >
        <CartProvider>
          <StoreHeader />
          {children}
          <StoreFooter />
          <BackToTopButton />
          <StoreToaster />
        </CartProvider>
      </body>
    </html>
  );
}
