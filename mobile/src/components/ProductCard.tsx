import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Heart } from "lucide-react-native";
import { colors, spacing, borderRadius, fontSizes } from "@/lib/theme";
import { Id } from "@convex/_generated/dataModel";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock?: boolean;
}

const { width } = Dimensions.get("window");
const cardWidth = (width - spacing.lg * 3) / 2;

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  images,
  inStock = true,
}: ProductCardProps) {
  const router = useRouter();
  const isWishlisted = useQuery(api.wishlist.isWishlisted, { productId: id });
  const toggleWishlist = useMutation(api.wishlist.toggle);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleWishlist = async () => {
    try {
      await toggleWishlist({ productId: id });
    } catch {}
  };

  const openProduct = () => router.push(`/product/${slug}`);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity activeOpacity={0.9} style={styles.imageTouchable} onPress={openProduct}>
          <Image source={{ uri: images[0] }} style={styles.image} />
          {!inStock && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
          {hasDiscount && inStock && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlist}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={18}
            color={isWishlisted ? colors.accent : colors.secondary}
            fill={isWishlisted ? colors.accent : "transparent"}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={openProduct} activeOpacity={0.9}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {hasDiscount && (
              <Text style={styles.comparePrice}>{formatPrice(compareAtPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: spacing.lg,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.primaryLight,
    position: "relative",
  },
  imageTouchable: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  wishlistButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(245,240,235,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutText: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.sm,
    color: colors.secondary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    fontFamily: "DMSans-Bold",
    fontSize: fontSizes.xs,
    color: colors.secondary,
  },
  info: {
    marginTop: spacing.sm,
  },
  name: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  price: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  comparePrice: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
});
