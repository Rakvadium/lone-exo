import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./lib/authorization";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const allOrders = await ctx.db.query("orders").collect();
    const recentOrders = allOrders.filter((o) => o.createdAt > thirtyDaysAgo);

    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((acc, o) => acc + o.total, 0);

    const monthlyRevenue = recentOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((acc, o) => acc + o.total, 0);

    const products = await ctx.db.query("products").collect();
    const activeProducts = products.filter((p) => p.isActive);

    const users = await ctx.db.query("users").collect();

    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;

    const lowStockProducts = await ctx.db
      .query("inventory")
      .collect()
      .then((inventory) =>
        inventory.filter(
          (i) => i.quantity - i.reservedQuantity <= i.lowStockThreshold
        )
      );

    return {
      totalRevenue,
      monthlyRevenue,
      totalOrders: allOrders.length,
      monthlyOrders: recentOrders.length,
      pendingOrders,
      totalProducts: activeProducts.length,
      totalUsers: users.length,
      lowStockCount: lowStockProducts.length,
    };
  },
});

export const getRecentOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 10;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          userName: user?.name ?? user?.email ?? "Unknown",
        };
      })
    );

    return ordersWithUsers;
  },
});

export const getLowStockProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const inventory = await ctx.db.query("inventory").collect();
    const lowStock = inventory.filter(
      (i) => i.quantity - i.reservedQuantity <= i.lowStockThreshold
    );

    const productsWithStock = await Promise.all(
      lowStock.map(async (inv) => {
        const product = await ctx.db.get(inv.productId);
        return {
          ...inv,
          productName: product?.name ?? "Unknown",
          productSlug: product?.slug,
          availableStock: inv.quantity - inv.reservedQuantity,
        };
      })
    );

    return productsWithStock;
  },
});

export const updateInventory = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .first();

    if (!inventory) {
      return await ctx.db.insert("inventory", {
        productId: args.productId,
        quantity: args.quantity,
        reservedQuantity: 0,
        lowStockThreshold: args.lowStockThreshold ?? 5,
        updatedAt: Date.now(),
      });
    }

    const updates: Record<string, unknown> = {
      quantity: args.quantity,
      updatedAt: Date.now(),
    };

    if (args.lowStockThreshold !== undefined) {
      updates.lowStockThreshold = args.lowStockThreshold;
    }

    await ctx.db.patch(inventory._id, updates);
    return inventory._id;
  },
});
