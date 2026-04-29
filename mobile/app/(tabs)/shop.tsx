import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import { Package, Search, XCircle } from "lucide-react-native";

export default function ShopScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");

  const categories = useQuery(api.categories.list);
  const products = useQuery(api.products.list, {});
  const searchResults = useQuery(
    api.products.search,
    searchQuery.length > 2 ? { query: searchQuery } : "skip"
  );

  const filteredProducts = (() => {
    let items = searchQuery.length > 2 ? searchResults : products;
    if (!items) return [];

    if (selectedCategory) {
      const cat = categories?.find((c) => c.slug === selectedCategory);
      if (cat) {
        items = items.filter((p) => p.categoryId === cat._id);
      }
    }

    return items;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.muted} strokeWidth={1.75} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <XCircle size={20} color={colors.muted} strokeWidth={1.75} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ _id: "", name: "All", slug: "" }, ...(categories || [])]}
          keyExtractor={(item) => item._id || "all"}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                selectedCategory === item.slug && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(item.slug)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === item.slug && styles.categoryPillTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        renderItem={({ item }) => (
          <ProductCard
            id={item._id}
            name={item.name}
            slug={item.slug}
            price={item.price}
            compareAtPrice={item.compareAtPrice}
            images={item.images}
            inStock={item.inStock}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={48} color={colors.muted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  title: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xxl,
    color: colors.secondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    margin: spacing.lg,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  categoriesContainer: {
    marginVertical: spacing.md,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.accent,
  },
  categoryPillText: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  categoryPillTextActive: {
    color: colors.secondary,
  },
  productsList: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    marginTop: spacing.md,
  },
});
