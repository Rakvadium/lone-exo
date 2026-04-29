import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getOrderForCheckout = internalQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    return order;
  },
});

export const updateOrderWithSession = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripeSessionId: args.stripeSessionId,
      updatedAt: Date.now(),
    });
  },
});

// Called when Stripe payment is confirmed via webhook
export const confirmPayment = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Skip if already confirmed (prevent double processing)
    if (order.status !== "pending") {
      return;
    }

    // 1. Update order status to confirmed
    await ctx.db.patch(args.orderId, {
      status: "confirmed",
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });

    // 2. Update inventory - reserve the quantities
    for (const item of order.items) {
      const inventory = await ctx.db
        .query("inventory")
        .withIndex("by_product", (q) => q.eq("productId", item.productId))
        .first();

      if (inventory) {
        await ctx.db.patch(inventory._id, {
          quantity: inventory.quantity - item.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    // 3. Clear the user's cart
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", order.userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});

// Called when payment fails or is cancelled - clean up pending order
export const cancelPendingOrder = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;

    // Only cancel if still pending
    if (order.status === "pending") {
      await ctx.db.patch(args.orderId, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }
  },
});
