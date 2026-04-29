import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("customer"), v.literal("admin"))),
    addresses: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          street: v.string(),
          city: v.string(),
          state: v.string(),
          postalCode: v.string(),
          country: v.string(),
          isDefault: v.boolean(),
        })
      )
    ),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_order", ["order"]),

  products: defineTable({
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
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_category_price", ["categoryId", "price"])
    .index("by_featured", ["isFeatured", "createdAt"])
    .index("by_active", ["isActive", "createdAt"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["categoryId", "isActive"],
    }),

  inventory: defineTable({
    productId: v.id("products"),
    variantId: v.optional(v.string()),
    quantity: v.number(),
    reservedQuantity: v.number(),
    lowStockThreshold: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_variant", ["productId", "variantId"]),

  cart: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    variantId: v.optional(v.string()),
    quantity: v.number(),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_user_product_variant", ["userId", "productId", "variantId"]),

  wishlist: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantId: v.optional(v.string()),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status", "createdAt"])
    .index("by_created", ["createdAt"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
    isVerifiedPurchase: v.boolean(),
    isApproved: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId", "createdAt"])
    .index("by_user", ["userId"])
    .index("by_approved", ["isApproved", "createdAt"]),

  flashSales: defineTable({
    name: v.string(),
    productIds: v.array(v.id("products")),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive", "endTime"])
    .index("by_time", ["startTime", "endTime"]),

  heroSlides: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    image: v.string(),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  }).index("by_active_order", ["isActive", "order"]),

  newsletter: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),
});
