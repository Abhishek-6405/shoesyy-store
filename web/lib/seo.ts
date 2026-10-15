import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
);

export function pageMetadata(title: string, description: string, path?: string, privatePage = false): Metadata {
  return {
    title: { absolute: `${title} | SHOESY` },
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
    openGraph: { title: `${title} | SHOESY`, description, type: "website", ...(path ? { url: path } : {}), images: ["/opengraph-image.png"] },
    twitter: { card: "summary_large_image", title: `${title} | SHOESY`, description, images: ["/opengraph-image.png"] },
  };
}
