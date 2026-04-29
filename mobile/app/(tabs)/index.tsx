import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import { ArrowRight, ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const heroSlides = useQuery(api.heroSlides.getActive);
  const featuredProducts = useQuery(api.products.getFeatured, { limit: 4 });
  const categories = useQuery(api.categories.list);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>LONE EXO</Text>
          <Text style={styles.tagline}>Beyond the Ordinary</Text>
        </View>

        {heroSlides && heroSlides[0] && (
          <TouchableOpacity
            style={styles.hero}
            onPress={() => router.push("/shop")}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: heroSlides[0].image }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{heroSlides[0].title}</Text>
              {heroSlides[0].subtitle && (
                <Text style={styles.heroSubtitle}>{heroSlides[0].subtitle}</Text>
              )}
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  {heroSlides[0].buttonText || "Shop Now"}
                </Text>
                <ArrowRight size={18} color={colors.secondary} strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push("/shop")} style={styles.viewAllRow}>
              <Text style={styles.viewAll}>View All</Text>
              <ChevronRight size={18} color={colors.accent} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts?.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                images={product.images}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories?.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryCard}
                onPress={() => router.push(`/shop?category=${category.slug}`)}
              >
                {category.image && (
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
                  />
                )}
                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.brandStory}>
          <Text style={styles.brandTitle}>Crafted for Excellence</Text>
          <Text style={styles.brandText}>
            At Lone Exo, we believe in the power of exceptional craftsmanship.
            Each piece is carefully designed and created using premium materials
            sourced from around the world.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  logo: {
    fontFamily: "Cormorant-Bold",
    fontSize: fontSizes.xxl,
    color: colors.secondary,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  hero: {
    width: width,
    height: width * 1.2,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    padding: spacing.xl,
  },
  heroTitle: {
    fontFamily: "Cormorant-Bold",
    fontSize: fontSizes.xxxl,
    color: colors.secondary,
  },
  heroSubtitle: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.secondary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  heroButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroButtonText: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  viewAll: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.accent,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoriesScroll: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  categoryCard: {
    width: 160,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginRight: spacing.md,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  categoryName: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
  },
  brandStory: {
    padding: spacing.xl,
    backgroundColor: colors.primaryLight,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  brandTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  brandText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    lineHeight: 24,
  },
});
