"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function HomePage() {
  const heroSlides = useQuery(api.heroSlides.getActive);
  const featuredProducts = useQuery(api.products.getFeatured, { limit: 8 });
  const categories = useQuery(api.categories.list);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative h-[80vh] overflow-hidden">
          {heroSlides && heroSlides[0] ? (
            <>
              <Image
                src={heroSlides[0].image}
                alt={heroSlides[0].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container">
                  <div className="max-w-xl space-y-6 animate-fade-in">
                    <h1 className="font-heading text-5xl md:text-7xl font-bold">
                      {heroSlides[0].title}
                    </h1>
                    {heroSlides[0].subtitle && (
                      <p className="text-xl text-muted-foreground">
                        {heroSlides[0].subtitle}
                      </p>
                    )}
                    {heroSlides[0].buttonText && (
                      <Button variant="shimmer" size="xl" asChild>
                        <Link href={heroSlides[0].buttonLink || "/products"}>
                          {heroSlides[0].buttonText}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="text-center space-y-4">
                <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-[0.15em]">
                  <span className="text-foreground">LONE</span>
                  <span className="text-rosegold ml-2 md:ml-4">EXO</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Beyond the Ordinary
                </p>
                <Button variant="shimmer" size="xl" asChild>
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="font-heading text-4xl font-bold">
                  Featured Collection
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Curated pieces for the discerning individual
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts ? (
                featuredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    images={product.images}
                    isFeatured={product.isFeatured}
                  />
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/30">
          <div className="container">
            <h2 className="font-heading text-4xl font-bold text-center mb-12">
              Shop by Category
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories ? (
                categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category.slug}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-lg"
                  >
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-heading text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center text-sm text-white/80 mt-2 group-hover:text-rosegold transition-colors">
                        Shop Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
                ))
              )}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-heading text-4xl font-bold">
                  Crafted for Excellence
                </h2>
                <p className="text-muted-foreground text-lg">
                  At Lone Exo, we believe in the power of exceptional
                  craftsmanship. Each piece is carefully designed and created
                  using premium materials sourced from around the world.
                </p>
                <div className="grid grid-cols-3 gap-6 pt-6">
                  <div>
                    <div className="font-accent text-3xl font-bold text-rosegold">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Premium Materials
                    </div>
                  </div>
                  <div>
                    <div className="font-accent text-3xl font-bold text-rosegold">
                      50+
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Countries Shipped
                    </div>
                  </div>
                  <div>
                    <div className="font-accent text-3xl font-bold text-rosegold">
                      10K+
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Happy Customers
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800"
                  alt="Craftsmanship"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-charcoal text-ivory">
          <div className="container">
            <h2 className="font-heading text-4xl font-bold text-center mb-12">
              What Our Customers Say
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah M.",
                  text: "The quality is exceptional. I've never felt more confident in my wardrobe choices.",
                  rating: 5,
                },
                {
                  name: "James L.",
                  text: "Finally found a brand that understands modern luxury. The fit is perfect every time.",
                  rating: 5,
                },
                {
                  name: "Elena K.",
                  text: "Worth every penny. The attention to detail sets Lone Exo apart from everything else.",
                  rating: 5,
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="bg-charcoal-light p-8 rounded-lg border border-border/20"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-rosegold text-rosegold"
                      />
                    ))}
                  </div>
                  <p className="text-ivory/80 mb-4">&ldquo;{review.text}&rdquo;</p>
                  <p className="font-medium">{review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
