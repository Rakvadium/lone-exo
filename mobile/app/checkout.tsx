import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import { ShoppingBag } from "lucide-react-native";

export default function CheckoutScreen() {
  const router = useRouter();
  const cart = useQuery(api.cart.get);
  const createOrder = useMutation(api.orders.create);
  const createCheckout = useAction(api.payments.createCheckoutSession);

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const subtotal = cart?.total ?? 0;
  const shipping = subtotal >= 10000 ? 0 : 999;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.postalCode) {
      return;
    }

    setIsLoading(true);

    try {
      const orderId = await createOrder({ shippingAddress: address });
      const { url } = await createCheckout({ orderId });

      if (url) {
        await Linking.openURL(url);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.secondary,
            headerTitle: "Checkout",
          }}
        />
        <View style={styles.empty}>
          <ShoppingBag size={56} color={colors.muted} strokeWidth={1.5} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button title="Continue Shopping" onPress={() => router.push("/shop")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.secondary,
          headerTitle: "Checkout",
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={address.street}
            onChangeText={(text) => setAddress({ ...address, street: text })}
          />
          <View style={styles.row}>
            <Input
              label="City"
              placeholder="New York"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
              containerStyle={{ flex: 1 }}
            />
            <View style={{ width: spacing.md }} />
            <Input
              label="State"
              placeholder="NY"
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              containerStyle={{ flex: 1 }}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Postal Code"
              placeholder="10001"
              value={address.postalCode}
              onChangeText={(text) => setAddress({ ...address, postalCode: text })}
              containerStyle={{ flex: 1 }}
            />
            <View style={{ width: spacing.md }} />
            <Input
              label="Country"
              value={address.country}
              onChangeText={(text) => setAddress({ ...address, country: text })}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.items.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name} x {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.paymentNote}>
            You will be redirected to Stripe to complete your payment securely.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isLoading ? "Processing..." : `Pay ${formatPrice(total)}`}
          onPress={handleCheckout}
          loading={isLoading}
          disabled={isLoading}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.lg,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  itemName: {
    flex: 1,
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  itemPrice: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary,
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  summaryValue: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
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
  paymentNote: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
  },
});
