import { notFound } from "next/navigation";
import { getActiveProductSlugs, getProductPageData } from "@/lib/catalog";
import { Container } from "@/components/ui/container";
import { ProductView } from "@/components/storefront/product-view";
import { ProductCard } from "@/components/storefront/product-card";
import type { Metadata } from "next";
import { pageMetadata, siteUrl } from "@/lib/seo";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// ISR: active products are pre-rendered at build; other slugs render on first request
// and are then cached. Regenerated every 60s or on revalidateTag("catalog").
export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const data = await getProductPageData(params.slug);
  if (!data) return { title: "Product not found", robots: { index: false } };
  const { product } = data;
  const description = product.description.slice(0, 160);
  const metadata = pageMetadata(product.name, description, `/products/${product.slug}`);
  const image = product.images[0] || "/opengraph-image.png";
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images: [{ url: image, alt: product.name }] },
    twitter: { ...metadata.twitter, card: "summary_large_image", images: [image] },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getActiveProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    // Don't fail the build if the DB is unreachable; pages will render on demand.
    console.warn("generateStaticParams: could not load product slugs", err instanceof Error ? err.name : "UnknownError");
    return [];
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const data = await getProductPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { product: formattedProduct, related: relatedProducts } = data;

  return (
    <div className="py-8 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: formattedProduct.name,
        description: formattedProduct.description,
        image: formattedProduct.images.map((image) => new URL(image, siteUrl).href),
        sku: formattedProduct.id,
        brand: { "@type": "Brand", name: formattedProduct.brand },
        offers: {
          "@type": "Offer",
          url: new URL(`/products/${formattedProduct.slug}`, siteUrl).href,
          priceCurrency: "INR",
          price: formattedProduct.price,
          availability: formattedProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(formattedProduct.reviews.length ? { aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: formattedProduct.averageRating,
          reviewCount: formattedProduct.reviews.length,
        } } : {}),
      }).replace(/</g, "\\u003c") }} />
      <Container className="space-y-16">
        <ProductView product={formattedProduct} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">
                Complete Your Rotation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-1">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
