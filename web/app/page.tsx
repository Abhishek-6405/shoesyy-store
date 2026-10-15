import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Premium sneakers and performance footwear", "Discover Nike, Adidas, Puma, Asics and more. Curated sneakers, verified stock and prices in INR.", "/");
import { getHomeData } from "@/lib/catalog";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroSection } from "@/components/storefront/hero-section";
import { BrandMarquee } from "@/components/storefront/brand-marquee";
import { CategoryTiles } from "@/components/storefront/category-tiles";
import { TestimonialsCarousel } from "@/components/storefront/testimonials-carousel";
import { ScrollReveal } from "@/components/storefront/scroll-reveal";
import { ArrowRight, Flame, Star } from "lucide-react";

// ISR: the page is statically cached and regenerated at most every 60s, or immediately
// when an admin/order mutation calls revalidateTag("catalog").
export const revalidate = 60;

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
      {/* Animated Hero Section with Parallax, Floating loop & Word Reveal */}
      <HeroSection />

      {/* Brand Strip as an infinite marquee that pauses on hover */}
      <BrandMarquee brands={brands} />

      {/* Category Tiles with hover zoom and sliding arrow */}
      <CategoryTiles categories={categories} />

      {/* Featured Products Grid with Scroll Reveal */}
      <ScrollReveal>
        <section>
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400 flex items-center gap-1.5 mb-1">
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
      </ScrollReveal>

      {/* Mid-page Statement Banner with Scroll Reveal */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="bg-zinc-950 text-white py-16 sm:py-20 relative overflow-hidden rounded-3xl mx-4 sm:mx-8 border border-zinc-800">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <Container>
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">
                Limited Edition Restocks
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                Never Settle For Ordinary Kicks.
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                Every sneaker in our vault is thoroughly checked for authenticity,
                boxed in premium packaging, and delivered fast right to your doorstep.
              </p>
              <div className="pt-2">
                <Button size="lg" asChild className="h-12 px-8 font-bold shadow-lg shadow-brand-500/20">
                  <Link href="/shop">Explore The Vault</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* Trending / Best Sellers with Scroll Reveal */}
      <ScrollReveal>
        <section>
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-brand-400 flex items-center gap-1.5 mb-1">
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
      </ScrollReveal>

      {/* Customer Testimonials Carousel */}
      <TestimonialsCarousel testimonials={testimonials} />
    </div>
  );
}
