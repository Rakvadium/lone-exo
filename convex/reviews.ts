import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireAdmin } from "./lib/authorization";

export const listByProduct = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isApproved"), true))
      .order("desc")
      .take(limit);

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? "Anonymous",
          userImage: user?.image,
        };
      })
    );

    return reviewsWithUsers;
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "delivered"),
          q.neq(q.field("items"), undefined)
        )
      )
      .collect();

    const hasPurchased = orders.some((order) =>
      order.items.some((item) => item.productId === args.productId)
    );

    return await ctx.db.insert("reviews", {
      userId,
      productId: args.productId,
      rating: Math.min(5, Math.max(1, args.rating)),
      title: args.title,
      content: args.content,
      isVerifiedPurchase: hasPurchased,
      isApproved: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("reviews"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const review = await ctx.db.get(args.id);

    if (!review || review.userId !== userId) {
      throw new Error("Review not found");
    }

    const { id, ...updates } = args;
    if (updates.rating) {
      updates.rating = Math.min(5, Math.max(1, updates.rating));
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const review = await ctx.db.get(args.id);

    if (!review) throw new Error("Review not found");

    const user = await ctx.db.get(userId);
    if (review.userId !== userId && user?.role !== "admin") {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.id);
  },
});

export const approve = mutation({
  args: {
    id: v.id("reviews"),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isApproved: args.isApproved });
  },
});
