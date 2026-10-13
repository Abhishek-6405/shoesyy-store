import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { ArrowRight, Flame, Sparkles, Star, Zap } from "lucide-react";

export const revalidate = 60; // ISR cache for 60 seconds

async function getHomeData() {
  const [featuredProducts, topRatedProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, featured: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { stock: "desc" },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const formatProducts = (products: typeof featuredProducts) =>
    products.map((p) => {
      const reviewCount = p.reviews.length;
      const avg =
        reviewCount > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
          : 4.8;
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
        averageRating: avg,
        reviewCount: reviewCount || 3,
      };
    });

  return {
    featured: formatProducts(featuredProducts),
    topRated: formatProducts(topRatedProducts),
    categories,
  };
}

export default async function HomePage() {
  const { featured, topRated, categories } = await getHomeData();

  const brands = [
    { name: "Nike", count: "8 models" },
    { name: "Adidas", count: "6 models" },
    { name: "Puma", count: "4 models" },
    { name: "Asics", count: "4 models" },
    { name: "New Balance", count: "2 models" },
    { name: "Jordan", count: "2 models" },
  ];

  const testimonials = [
    {
      name: "Rohit Sharma",
      role: "Verified Sneakerhead",
      quote:
        "The delivery was insanely fast to Mumbai! The Nike Air Max 90 arrived in double-boxed mint condition. Easily the cleanest sneaker shop in India.",
      rating: 5,
      shoe: "Nike Air Max 90",
    },
    {
      name: "Ananya Deshmukh",
      role: "Marathon Runner",
      quote:
        "Ordered the Asics Gel-Kayano 30 for my half marathon training. Sizing guidance was spot on and COD payment was totally seamless.",
      rating: 5,
      shoe: "Asics Gel-Kayano 30",
    },
    {
      name: "Kabir Malhotra",
      role: "Streetwear Enthusiast",
      quote:
        "Finally a sneaker marketplace with zero fluff. Transparent prices in Rupees, 100% authentic kicks, and proper stock updates.",
      rating: 5,
      shoe: "Adidas Ultraboost Light",
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900/80 dark:to-zinc-950 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Text & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Drop Collection 2026 • Live Now
              </div>

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white leading-[0.95]">
                Unleash Your <span className="text-brand-500">Stride.</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Step into the culture with curated authentic sneakers from Nike,
                Adidas, Puma, and Asics. Engineered for comfort, designed for the streets.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-xl shadow-brand-500/25">
                  <Link href="/shop" className="flex items-center justify-center gap-2">
                    Shop New Drops
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-base font-bold">
                  <Link href="/shop?featured=true">View Featured</Link>
                </Button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                    26+
                  </span>
                  <span className="text-xs text-zinc-500 block font-medium">
                    Iconic Silhouette Styles
                  </span>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                    100%
                  </span>
                  <span className="text-xs text-zinc-500 block font-medium">
                    Verified Authentic
                  </span>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                    FREE
                  </span>
                  <span className="text-xs text-zinc-500 block font-medium">
                    Shipping Over ₹2,000
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-lg">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-3xl transform -rotate-12 scale-90" />

                <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-4 shadow-2xl">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=85"
                      alt="Featured Sneaker Drop"
                      fill
                      priority
                      className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                  </div>

                  {/* Floating floating badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 block">
                        Trending Drop
                      </span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        Nike Air Max 90 Infrared
                      </p>
                    </div>
                    <span className="text-base font-black text-zinc-900 dark:text-white">
                      ₹11,999
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Brand Strip */}
      <section className="py-2">
        <Container>
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Trusted Brand Partners
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map((b) => (
              <Link
                key={b.name}
                href={`/shop?brand=${encodeURIComponent(b.name)}`}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 transition-all text-center"
              >
                <span className="font-display text-xl sm:text-2xl font-black italic tracking-wider text-zinc-800 dark:text-zinc-200 group-hover:text-brand-500 transition-colors uppercase">
                  {b.name}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 mt-1">
                  {b.count}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Category Tiles */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Explore By Category
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Find Your Silhouette
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View All Categories
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all"
              >
                <Image
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
                  }
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <h3 className="font-display text-2xl font-black uppercase italic leading-none">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-zinc-300 mt-1 block">
                    {cat._count.products} {cat._count.products === 1 ? "Pair" : "Pairs"} Available
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products Grid */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Hype Collection
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Featured Sneakers
              </h2>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/shop?featured=true" className="flex items-center gap-2">
                Browse All Drops
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Mid-page Banner */}
      <section className="bg-zinc-950 text-white py-16 sm:py-20 relative overflow-hidden">
        <Container>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-brand-500">
              Limited Edition Restocks
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Never Settle For Ordinary Kicks.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every sneaker in our vault is thoroughly checked for authenticity,
              boxed in premium packaging, and delivered fast right to your doorstep.
            </p>
            <div className="pt-2">
              <Button size="lg" asChild className="h-12 px-8 font-bold">
                <Link href="/shop">Explore The Vault</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Trending / Best Sellers */}
      <section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                Community Favorites
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Trending Right Now
              </h2>
            </div>
            <Link
              href="/shop?sort=rating"
              className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              See All Top Rated
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRated.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 py-16 border-y border-zinc-200/80 dark:border-zinc-800">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-brand-500">
              Verified Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-1 text-zinc-900 dark:text-white">
              Loved By Sneakerheads
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Over 10,000+ pairs delivered across Delhi, Mumbai, Bengaluru, and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {t.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400">{t.role}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                    {t.shoe}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
