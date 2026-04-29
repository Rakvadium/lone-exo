"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock?: boolean;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  images,
  inStock = true,
  isFeatured,
}: ProductCardProps) {
  const isWishlisted = useQuery(api.wishlist.isWishlisted, { productId: id });
  const toggleWishlist = useMutation(api.wishlist.toggle);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist({ productId: id });
    } catch {
    }
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {!inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary">Sold Out</Badge>
          </div>
        )}

        {hasDiscount && inStock && (
          <Badge className="absolute top-3 left-3 bg-rosegold">
            -{discountPercentage}%
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 bg-background/80 hover:bg-background transition-all",
            isWishlisted && "text-rosegold"
          )}
          onClick={handleWishlistClick}
        >
          <Heart
            className={cn("h-4 w-4", isWishlisted && "fill-current")}
          />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="shimmer" className="w-full">
            Quick View
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-medium text-sm group-hover:text-rosegold transition-colors line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-accent text-sm">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
