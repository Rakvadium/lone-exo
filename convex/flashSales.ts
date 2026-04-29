import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./lib/authorization";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const flashSales = await ctx.db
      .query("flashSales")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) =>
        q.and(
          q.lte(q.field("startTime"), now),
          q.gte(q.field("endTime"), now)
        )
      )
      .collect();

    const salesWithProducts = await Promise.all(
      flashSales.map(async (sale) => {
        const products = await Promise.all(
          sale.productIds.map((id) => ctx.db.get(id))
        );
        return {
          ...sale,
          products: products.filter((p) => p !== null),
        };
      })
    );

    return salesWithProducts;
  },
});

export const getProductDiscount = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const flashSales = await ctx.db
      .query("flashSales")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) =>
        q.and(
          q.lte(q.field("startTime"), now),
          q.gte(q.field("endTime"), now)
        )
      )
      .collect();

    for (const sale of flashSales) {
      if (sale.productIds.includes(args.productId)) {
        return {
          discountType: sale.discountType,
          discountValue: sale.discountValue,
          endTime: sale.endTime,
          saleName: sale.name,
        };
      }
    }

    return null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("flashSales").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    productIds: v.array(v.id("products")),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("flashSales", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("flashSales"),
    name: v.optional(v.string()),
    productIds: v.optional(v.array(v.id("products"))),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    discountValue: v.optional(v.number()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("flashSales") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
