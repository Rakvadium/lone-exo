"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Heart, Minus, Plus, Star, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = useQuery(api.products.getBySlug, { slug });
  const isWishlisted = useQuery(
    api.wishlist.isWishlisted,
    product ? { productId: product._id } : "skip"
  );
  const discount = useQuery(
    api.flashSales.getProductDiscount,
    product ? { productId: product._id } : "skip"
  );

  const addToCart = useMutation(api.cart.add);
  const toggleWishlist = useMutation(api.wishlist.toggle);

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold mb-4">
              Product Not Found
            </h1>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = discount
    ? discount.discountType === "percentage"
      ? Math.round(product?.price ?? 0 * (1 - discount.discountValue / 100))
      : (product?.price ?? 0) - discount.discountValue
    : product?.price ?? 0;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        productId: product._id,
        quantity,
      });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      router.push("/auth/signin");
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    try {
      await toggleWishlist({ productId: product._id });
    } catch {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save items.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {product?.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product?.name}</span>
          </nav>

          {product ? (
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {discount && (
                    <Badge className="absolute top-4 left-4 bg-rosegold">
                      {discount.discountType === "percentage"
                        ? `-${discount.discountValue}%`
                        : `-${formatPrice(discount.discountValue)}`}
                    </Badge>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "relative w-20 aspect-[3/4] rounded-md overflow-hidden border-2 transition-colors",
                          selectedImage === index
                            ? "border-rosegold"
                            : "border-transparent hover:border-border"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="font-heading text-4xl font-bold">
                    {product.name}
                  </h1>

                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(product.averageRating)
                                ? "fill-rosegold text-rosegold"
                                : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-accent text-3xl font-bold">
                    {formatPrice(finalPrice)}
                  </span>
                  {discount && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground">{product.description}</p>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity</span>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setQuantity(Math.min(product.stockQuantity, quantity + 1))
                        }
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.stockQuantity} in stock
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="shimmer"
                      size="lg"
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleToggleWishlist}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          isWishlisted && "fill-rosegold text-rosegold"
                        )}
                      />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Truck className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm mt-2">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">
                      Orders over $100
                    </p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm mt-2">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30 day policy</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm mt-2">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      SSL encrypted
                    </p>
                  </div>
                </div>

                {product.reviews.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="font-heading text-xl font-semibold mb-4">
                        Customer Reviews
                      </h2>
                      <div className="space-y-4">
                        {product.reviews.slice(0, 3).map((review) => (
                          <div
                            key={review._id}
                            className="p-4 rounded-lg bg-secondary/50"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < review.rating
                                        ? "fill-rosegold text-rosegold"
                                        : "text-muted"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                {review.userName}
                              </span>
                              {review.isVerifiedPurchase && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <div className="flex gap-4">
                  <Skeleton className="w-20 aspect-[3/4]" />
                  <Skeleton className="w-20 aspect-[3/4]" />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
