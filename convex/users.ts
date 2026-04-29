import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, getOptionalUser } from "./lib/authorization";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalUser(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const orderCount = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const wishlistCount = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      ...user,
      orderCount: orderCount.length,
      wishlistCount: wishlistCount.length,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.image !== undefined) updates.image = args.image;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return userId;
  },
});

export const addAddress = mutation({
  args: {
    label: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const user = await ctx.db.get(userId);

    if (!user) throw new Error("User not found");

    const addresses = user.addresses ?? [];

    if (args.isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      id: crypto.randomUUID(),
      ...args,
    };

    addresses.push(newAddress);

    await ctx.db.patch(userId, { addresses });

    return newAddress.id;
  },
});

export const updateAddress = mutation({
  args: {
    addressId: v.string(),
    label: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const user = await ctx.db.get(userId);

    if (!user) throw new Error("User not found");

    const addresses = user.addresses ?? [];
    const index = addresses.findIndex((addr) => addr.id === args.addressId);

    if (index === -1) throw new Error("Address not found");

    if (args.isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const { addressId, ...updates } = args;
    Object.assign(addresses[index], updates);

    await ctx.db.patch(userId, { addresses });

    return addressId;
  },
});

export const removeAddress = mutation({
  args: { addressId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const user = await ctx.db.get(userId);

    if (!user) throw new Error("User not found");

    const addresses = (user.addresses ?? []).filter(
      (addr) => addr.id !== args.addressId
    );

    await ctx.db.patch(userId, { addresses });
  },
});
