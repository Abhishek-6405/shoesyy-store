import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { ProductView } from "@/components/storefront/product-view";
import { ProductCard } from "@/components/storefront/product-card";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 30; // ISR 30 seconds

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ slug }, { id: slug }],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, username: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related active products from same category or brand
  const relatedRaw = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { categoryId: product.categoryId },
        { brand: { equals: product.brand, mode: "insensitive" } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const reviewCount = product.reviews.length;
  const avg =
    reviewCount > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 4.8;

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    isFeatured: product.featured,
    category: product.category,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    averageRating: avg,
    reviewCount,
  };

  const relatedProducts = relatedRaw.map((p) => {
    const count = p.reviews.length;
    const rAvg =
      count > 0 ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / count : 4.8;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: Number(p.price),
      stock: p.stock,
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      isFeatured: p.featured,
      category: p.category,
      averageRating: rAvg,
      reviewCount: count || 3,
    };
  });

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
