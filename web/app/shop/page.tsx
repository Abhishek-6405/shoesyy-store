import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Shop sneakers", "Find your next pair by brand, size, color and price. Explore premium sneakers and performance runners.", "/shop");
import { getShopFacets, getShopProducts } from "@/lib/catalog";
import { Container } from "@/components/ui/container";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { ShopSort } from "@/components/storefront/shop-sort";
import { ShopProductGrid } from "@/components/storefront/shop-product-grid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";

interface ShopPageProps {
  searchParams: {
    search?: string;
    brand?: string;
    category?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    featured?: string;
  };
}

// The page reads searchParams so it renders per request, but its data comes from
// unstable_cache (tag "catalog", 60s), so repeat filter combinations skip the DB.
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const search = searchParams.search?.trim() || undefined;
  const category = searchParams.category?.trim() || undefined;
  const sort = searchParams.sort || "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12;

  const [{ total: totalProducts, products }, facets] = await Promise.all([
    getShopProducts({
      search,
      brand: searchParams.brand?.trim() || undefined,
      category,
      size: searchParams.size ? Number(searchParams.size) : undefined,
      color: searchParams.color?.trim() || undefined,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      featured: searchParams.featured === "true",
      sort,
      page,
      limit,
    }),
    getShopFacets(),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  // Build pagination links helper
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== "page") params.set(key, val);
    });
    params.set("page", pageNumber.toString());
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <span>Vault Catalog</span>
              <span>•</span>
              <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{totalProducts} Sneakers</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
              {search ? `Results for "${search}"` : category ? `${category.toUpperCase()} SILHOUETTES` : "All Sneakers"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ShopSort />
          </div>
        </div>

        {/* Catalog layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ShopFilters
            categories={facets.categories}
            brands={facets.brands}
            sizes={facets.sizes}
            colors={facets.colors}
          />

          {/* Product Grid Area */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 p-6 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-4">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold uppercase text-zinc-900 dark:text-white mb-2">
                  No Sneakers Match Your Filters
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mb-6">
                  Try broadening your search, removing selected sizes, or clearing your brand filters.
                </p>
                <Button asChild>
                  <Link href="/shop">Clear All Filters</Link>
                </Button>
              </div>
            ) : (
              <>
                <ShopProductGrid products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                    {page > 1 ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={createPageUrl(page - 1)} className="flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}

                    <div className="flex items-center gap-1 px-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Page {page} of {totalPages}
                    </div>

                    {page < totalPages ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={createPageUrl(page + 1)} className="flex items-center gap-1">
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
