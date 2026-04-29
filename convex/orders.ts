import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireAdmin, requireOwnershipOrAdmin, getOptionalUser } from "./lib/authorization";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LEX-${timestamp}-${random}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return orders;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const order = await ctx.db.get(args.id);

    if (!order) return null;

    const user = await ctx.db.get(userId);
    if (order.userId !== userId && user?.role !== "admin") {
      return null;
    }

    return order;
  },
});

export const create = mutation({
  args: {
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate stock availability (but don't reserve yet)
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) throw new Error("Product not found");

        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", item.productId))
          .first();

        if (!inventory || inventory.quantity - inventory.reservedQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // DON'T reserve inventory here - wait for successful payment

        return {
          productId: item.productId,
          variantId: item.variantId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0],
        };
      })
    );

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= 10000 ? 0 : 999;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      userId,
      orderNumber: generateOrderNumber(),
      status: "pending",
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: args.shippingAddress,
      createdAt: now,
      updatedAt: now,
    });

    // DON'T clear cart here - wait for successful payment

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.trackingNumber) {
      updates.trackingNumber = args.trackingNumber;
    }

    // If cancelling a confirmed order, restore inventory
    if (args.status === "cancelled" && order.status === "confirmed") {
      for (const item of order.items) {
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", item.productId))
          .first();

        if (inventory) {
          await ctx.db.patch(inventory._id, {
            quantity: inventory.quantity + item.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    }

    // If refunding a delivered/shipped order, restore inventory
    if (args.status === "refunded" && ["shipped", "delivered"].includes(order.status)) {
      for (const item of order.items) {
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", item.productId))
          .first();

        if (inventory) {
          await ctx.db.patch(inventory._id, {
            quantity: inventory.quantity + item.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled"),
        v.literal("refunded")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 50;

    const orders = args.status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(limit)
      : await ctx.db.query("orders").order("desc").take(limit);

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
