"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const categories = useQuery(api.categories.list);
  const allProducts = useQuery(api.products.list, {});
  const searchResults = useQuery(
    api.products.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);

  const filteredProducts = useMemo(() => {
    let products = searchQuery.length > 2 ? searchResults : allProducts;

    if (!products) return null;

    if (categorySlug && !searchQuery) {
      const category = categories?.find((c) => c.slug === categorySlug);
      if (category) {
        products = products.filter((p) => p.categoryId === category._id);
      }
    }

    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }

    return sorted;
  }, [allProducts, searchResults, searchQuery, categorySlug, categories, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-4xl font-bold">
                {selectedCategory?.name || "All Products"}
              </h1>
              {filteredProducts && (
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} products
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Categories</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    <Link
                      href="/products"
                      className={cn(
                        "block px-3 py-2 rounded-md transition-colors",
                        !categorySlug
                          ? "bg-rosegold text-white"
                          : "hover:bg-secondary"
                      )}
                    >
                      All Products
                    </Link>
                    {categories?.map((category) => (
                      <Link
                        key={category._id}
                        href={`/products?category=${category.slug}`}
                        className={cn(
                          "block px-3 py-2 rounded-md transition-colors",
                          categorySlug === category.slug
                            ? "bg-rosegold text-white"
                            : "hover:bg-secondary"
                        )}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="hidden md:block w-64 shrink-0">
              <h2 className="font-heading text-lg font-semibold mb-4">
                Categories
              </h2>
              <nav className="space-y-2">
                <Link
                  href="/products"
                  className={cn(
                    "block px-3 py-2 rounded-md transition-colors text-sm",
                    !categorySlug
                      ? "bg-rosegold text-white"
                      : "hover:bg-secondary"
                  )}
                >
                  All Products
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category.slug}`}
                    className={cn(
                      "block px-3 py-2 rounded-md transition-colors text-sm",
                      categorySlug === category.slug
                        ? "bg-rosegold text-white"
                        : "hover:bg-secondary"
                    )}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts ? (
                  filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        compareAtPrice={product.compareAtPrice}
                        images={product.images}
                        inStock={product.inStock}
                        isFeatured={product.isFeatured}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  )
                ) : (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[3/4] rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
