import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, getOptionalUser } from "./lib/authorization";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return { items: [], total: 0 };

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", item.productId))
          .first();

        return {
          ...item,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images,
          },
          inStock: inventory
            ? inventory.quantity - inventory.reservedQuantity >= item.quantity
            : false,
          maxQuantity: inventory
            ? inventory.quantity - inventory.reservedQuantity
            : 0,
        };
      })
    );

    const validItems = itemsWithProducts.filter((item) => item !== null);
    const total = validItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    return { items: validItems, total };
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.optional(v.string()),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product_variant", (q) =>
        q
          .eq("userId", userId)
          .eq("productId", args.productId)
          .eq("variantId", args.variantId)
      )
      .first();

    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return existingItem._id;
    }

    return await ctx.db.insert("cart", {
      userId,
      productId: args.productId,
      variantId: args.variantId,
      quantity: args.quantity,
      addedAt: Date.now(),
    });
  },
});

export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const cartItem = await ctx.db.get(args.cartItemId);

    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return null;
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    return args.cartItemId;
  },
});

export const remove = mutation({
  args: { cartItemId: v.id("cart") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const cartItem = await ctx.db.get(args.cartItemId);

    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(args.cartItemId);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});
