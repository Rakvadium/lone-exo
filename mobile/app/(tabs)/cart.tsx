import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/Button";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";

export default function CartScreen() {
  const router = useRouter();
  const cart = useQuery(api.cart.get);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.remove);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const subtotal = cart?.total ?? 0;
  const shipping = subtotal >= 10000 ? 0 : 999;
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateQuantity({ cartItemId: cartItemId as any, quantity });
    } catch {}
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeItem({ cartItemId: cartItemId as any });
    } catch {}
  };

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Cart</Text>
        </View>
        <View style={styles.empty}>
          <ShoppingBag size={64} color={colors.muted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some items to get started
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push("/shop")}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cart.items.length} items</Text>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.product.images[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.product.price)}
              </Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item._id, item.quantity - 1)
                  }
                >
                  <Minus size={16} color={colors.secondary} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item._id, item.quantity + 1)
                  }
                >
                  <Plus size={16} color={colors.secondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(item._id)}
                style={styles.removeButton}
              >
                <Trash2 size={18} color={colors.error} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Button
          title="Checkout"
          onPress={() => router.push("/checkout")}
          style={{ marginTop: spacing.md }}
        />
      </View>
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
  itemCount: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.lg,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: borderRadius.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  itemName: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  itemPrice: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
    marginHorizontal: spacing.md,
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  removeButton: {
    padding: spacing.sm,
  },
  summary: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  summaryValue: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  totalRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
  },
  totalValue: {
    fontFamily: "DMSans-Bold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
  },
});
