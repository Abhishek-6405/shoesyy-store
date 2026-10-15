import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { siteUrl } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  title: { default: "SHOESY | Premium Sneaker Store", template: "%s | SHOESY" },
  description:
    "Explore the most coveted sneakers, performance runners, and iconic streetwear kicks with express delivery across India.",
  openGraph: { type: "website", siteName: "SHOESY", locale: "en_IN", images: ["/opengraph-image.png"] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const stored = localStorage.getItem("shoesy-theme");
                if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (_) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
