import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, getOptionalUser } from "./lib/authorization";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return [];

    const wishlistItems = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const itemsWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        return {
          ...item,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images,
          },
        };
      })
    );

    return itemsWithProducts.filter((item) => item !== null);
  },
});

export const isWishlisted = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return false;

    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    return item !== null;
  },
});

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    }

    await ctx.db.insert("wishlist", {
      userId,
      productId: args.productId,
      addedAt: Date.now(),
    });

    return { added: true };
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});
