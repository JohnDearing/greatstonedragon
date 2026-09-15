import type { Metadata } from "next";
import localFont from "next/font/local";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CartProvider } from "@/components/cart-provider";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { StoreToaster } from "@/components/store-toaster";
import "./globals.css";

const alexanderQuill = localFont({
  src: "../public/fonts/AlexanderQuillW01-Regular.ttf",
  variable: "--font-primary",
  display: "swap",
  weight: "400",
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
        className={`${alexanderQuill.variable} ${alexanderQuill.className}`}
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
