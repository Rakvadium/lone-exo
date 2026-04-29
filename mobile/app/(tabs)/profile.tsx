import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/Button";
import { colors, spacing, fontSizes, borderRadius } from "@/lib/theme";
import {
  ChevronRight,
  CircleHelp,
  Heart,
  LogOut,
  Package,
  Settings,
  User,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getProfile);
  const orders = useQuery(api.orders.list);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/signin");
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.authPrompt}>
          <User size={64} color={colors.muted} strokeWidth={1.5} />
          <Text style={styles.authTitle}>Sign in to your account</Text>
          <Text style={styles.authText}>
            View your orders, wishlist, and more
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push("/(auth)/signin")}
            style={{ marginTop: spacing.lg }}
          />
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            style={{ marginTop: spacing.md }}
          >
            <Text style={styles.signUpLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.name || user.email || "U")[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || "User"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Package size={24} color={colors.accent} strokeWidth={1.75} />
            <Text style={styles.statValue}>{user.orderCount ?? 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.stat}>
            <Heart size={24} color={colors.accent} strokeWidth={1.75} />
            <Text style={styles.statValue}>{user.wishlistCount ?? 0}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders && orders.length > 0 ? (
            orders.slice(0, 3).map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>
                    #{order.orderNumber}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      order.status === "delivered" && styles.statusDelivered,
                      order.status === "cancelled" && styles.statusCancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>
                  {formatDate(order.createdAt)}
                </Text>
                <Text style={styles.orderTotal}>
                  {order.items.length} items • {formatPrice(order.total)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noOrdersWrap}>
              <Package size={40} color={colors.muted} strokeWidth={1.5} />
              <Text style={styles.noOrders}>No orders yet</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem}>
            <Settings size={22} color={colors.secondary} strokeWidth={1.75} />
            <Text style={styles.actionText}>Settings</Text>
            <ChevronRight size={20} color={colors.muted} strokeWidth={1.75} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <CircleHelp size={22} color={colors.secondary} strokeWidth={1.75} />
            <Text style={styles.actionText}>Help & Support</Text>
            <ChevronRight size={20} color={colors.muted} strokeWidth={1.75} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
            <LogOut size={22} color={colors.error} strokeWidth={1.75} />
            <Text style={[styles.actionText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
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
  authPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  authTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
    marginTop: spacing.lg,
  },
  authText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  signUpLink: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "DMSans-Bold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
  },
  userInfo: {
    marginLeft: spacing.md,
  },
  userName: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
  },
  userEmail: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "DMSans-Bold",
    fontSize: fontSizes.xl,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.muted + "30",
  },
  statusDelivered: {
    backgroundColor: colors.success + "30",
  },
  statusCancelled: {
    backgroundColor: colors.error + "30",
  },
  statusText: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.xs,
    color: colors.secondary,
  },
  orderDate: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  orderTotal: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.sm,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  noOrdersWrap: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  noOrders: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    textAlign: "center",
  },
  actions: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  actionText: {
    flex: 1,
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
    marginLeft: spacing.md,
  },
});
