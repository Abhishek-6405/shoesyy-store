import { notFound } from "next/navigation";
import { getActiveProductSlugs, getProductPageData } from "@/lib/catalog";
import { Container } from "@/components/ui/container";
import { ProductView } from "@/components/storefront/product-view";
import { ProductCard } from "@/components/storefront/product-card";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// ISR: active products are pre-rendered at build; other slugs render on first request
// and are then cached. Regenerated every 60s or on revalidateTag("catalog").
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getActiveProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    // Don't fail the build if the DB is unreachable; pages will render on demand.
    console.warn("generateStaticParams: could not load product slugs", err);
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
      <Container className="space-y-16">
        <ProductView product={formattedProduct} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-brand-500">
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
