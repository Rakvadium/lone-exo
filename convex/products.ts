import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./lib/authorization";

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.categoryId) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!));
    }

    const products = await productsQuery.order("desc").take(limit);

    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .first();

        return {
          ...product,
          inStock: inventory ? inventory.quantity - inventory.reservedQuantity > 0 : false,
          stockQuantity: inventory ? inventory.quantity - inventory.reservedQuantity : 0,
        };
      })
    );

    return productsWithInventory;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!product) return null;

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .first();

    const category = await ctx.db.get(product.categoryId);

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .filter((q) => q.eq(q.field("isApproved"), true))
      .order("desc")
      .take(10);

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? "Anonymous",
        };
      })
    );

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return {
      ...product,
      category,
      inStock: inventory ? inventory.quantity - inventory.reservedQuantity > 0 : false,
      stockQuantity: inventory ? inventory.quantity - inventory.reservedQuantity : 0,
      reviews: reviewsWithUsers,
      averageRating: avgRating,
      reviewCount: reviews.length,
    };
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;

    const products = await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .order("desc")
      .take(limit);

    return products;
  },
});

export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const results = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", args.query).eq("isActive", true)
      )
      .take(limit);

    return await Promise.all(
      results.map(async (product) => {
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .first();

        return {
          ...product,
          inStock: inventory ? inventory.quantity - inventory.reservedQuantity > 0 : false,
          stockQuantity: inventory ? inventory.quantity - inventory.reservedQuantity : 0,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    variants: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          sku: v.string(),
          price: v.optional(v.number()),
          attributes: v.record(v.string(), v.string()),
        })
      )
    ),
    attributes: v.optional(v.record(v.string(), v.string())),
    tags: v.optional(v.array(v.string())),
    isFeatured: v.boolean(),
    initialStock: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const { initialStock, ...productData } = args;

    const productId = await ctx.db.insert("products", {
      ...productData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("inventory", {
      productId,
      quantity: initialStock,
      reservedQuantity: 0,
      lowStockThreshold: 5,
      updatedAt: now,
    });

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    images: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
  },
});
