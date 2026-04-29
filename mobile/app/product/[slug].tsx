import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/Button";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import {
  CircleCheck,
  CircleX,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = useQuery(api.products.getBySlug, { slug: slug || "" });
  const addToCart = useMutation(api.cart.add);
  const toggleWishlist = useMutation(api.wishlist.toggle);
  const isWishlisted = useQuery(
    api.wishlist.isWishlisted,
    product ? { productId: product._id } : "skip"
  );

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart({ productId: product._id, quantity });
      router.push("/cart");
    } catch {
      router.push("/(auth)/signin");
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist({ productId: product._id });
    } catch {}
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.secondary,
          headerTitle: "",
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleWishlist} hitSlop={12}>
              <Heart
                size={24}
                color={isWishlisted ? colors.accent : colors.secondary}
                fill={isWishlisted ? colors.accent : "transparent"}
                strokeWidth={1.75}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setSelectedImage(index);
          }}
        >
          {product.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
        </ScrollView>

        {product.images.length > 1 && (
          <View style={styles.pagination}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  selectedImage === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.category}>{product.category?.name}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.compareAtPrice && (
              <Text style={styles.comparePrice}>
                {formatPrice(product.compareAtPrice)}
              </Text>
            )}
          </View>

          {product.reviewCount > 0 && (
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(product.averageRating);
                return (
                  <Star
                    key={i}
                    size={16}
                    color={filled ? colors.accent : colors.muted}
                    fill={filled ? colors.accent : "transparent"}
                    strokeWidth={1.75}
                  />
                );
              })}
              <Text style={styles.reviewCount}>
                ({product.reviewCount} reviews)
              </Text>
            </View>
          )}

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.stockInfo}>
            {product.inStock ? (
              <CircleCheck size={18} color={colors.success} strokeWidth={1.75} />
            ) : (
              <CircleX size={18} color={colors.error} strokeWidth={1.75} />
            )}
            <Text
              style={[
                styles.stockText,
                { color: product.inStock ? colors.success : colors.error },
              ]}
            >
              {product.inStock
                ? `${product.stockQuantity} in stock`
                : "Out of stock"}
            </Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color={colors.secondary} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity(Math.min(product.stockQuantity, quantity + 1))
                }
              >
                <Plus size={20} color={colors.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Truck size={20} color={colors.muted} strokeWidth={1.75} />
              <Text style={styles.featureText}>Free shipping over $100</Text>
            </View>
            <View style={styles.feature}>
              <RotateCcw size={20} color={colors.muted} strokeWidth={1.75} />
              <Text style={styles.featureText}>30-day returns</Text>
            </View>
            <View style={styles.feature}>
              <ShieldCheck size={20} color={colors.muted} strokeWidth={1.75} />
              <Text style={styles.featureText}>Secure payment</Text>
            </View>
          </View>

          {product.reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Reviews</Text>
              {product.reviews.slice(0, 3).map((review) => (
                <View key={review._id} style={styles.review}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={colors.accent}
                          fill={colors.accent}
                          strokeWidth={1.5}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewAuthor}>{review.userName}</Text>
                  </View>
                  <Text style={styles.reviewContent}>{review.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={product.inStock ? "Add to Cart" : "Out of Stock"}
          onPress={handleAddToCart}
          disabled={!product.inStock}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  image: {
    width: width,
    height: width * 1.2,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  paginationDotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  content: {
    padding: spacing.lg,
  },
  category: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    fontFamily: "Cormorant-Bold",
    fontSize: fontSizes.xxl,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  price: {
    fontFamily: "DMSans-Bold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
  },
  comparePrice: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.lg,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  reviewCount: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  description: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    lineHeight: 24,
    marginTop: spacing.lg,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stockText: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primaryLight,
  },
  quantityLabel: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginHorizontal: spacing.lg,
    minWidth: 32,
    textAlign: "center",
  },
  features: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featureText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  reviewsSection: {
    marginTop: spacing.xl,
  },
  reviewsTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  review: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewAuthor: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  reviewContent: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    backgroundColor: colors.primary,
  },
});
