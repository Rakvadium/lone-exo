import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCategories = await ctx.db.query("categories").first();
    if (existingCategories) {
      return { message: "Database already seeded" };
    }

    const womenId = await ctx.db.insert("categories", {
      name: "Women",
      slug: "women",
      description: "Women's apparel and accessories",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
      order: 1,
      isActive: true,
    });

    const menId = await ctx.db.insert("categories", {
      name: "Men",
      slug: "men",
      description: "Men's apparel and accessories",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      order: 2,
      isActive: true,
    });

    const accessoriesId = await ctx.db.insert("categories", {
      name: "Accessories",
      slug: "accessories",
      description: "Premium accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      order: 3,
      isActive: true,
    });

    const newArrivalsId = await ctx.db.insert("categories", {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Latest drops",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
      order: 4,
      isActive: true,
    });

    const now = Date.now();

    const products = [
      {
        name: "Midnight Silk Blazer",
        slug: "midnight-silk-blazer",
        description: "Luxurious silk-blend blazer with a modern slim fit. Features subtle sheen and hand-finished details that elevate any ensemble.",
        shortDescription: "Premium silk-blend blazer",
        price: 28900,
        compareAtPrice: 34900,
        categoryId: womenId,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800",
        ],
        isFeatured: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["blazer", "silk", "formal"],
      },
      {
        name: "Eclipse Wool Coat",
        slug: "eclipse-wool-coat",
        description: "Statement wool coat crafted from Italian merino. Double-breasted design with horn buttons and satin lining.",
        shortDescription: "Italian merino wool coat",
        price: 45900,
        categoryId: womenId,
        images: [
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800",
        ],
        isFeatured: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["coat", "wool", "winter"],
      },
      {
        name: "Obsidian Cashmere Sweater",
        slug: "obsidian-cashmere-sweater",
        description: "Ultra-soft cashmere sweater in deep charcoal. Relaxed fit with ribbed cuffs and hem.",
        shortDescription: "Pure cashmere luxury",
        price: 32900,
        categoryId: menId,
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        ],
        isFeatured: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["sweater", "cashmere", "luxury"],
      },
      {
        name: "Apex Tailored Trousers",
        slug: "apex-tailored-trousers",
        description: "Precision-tailored trousers in premium wool blend. Flat front with hidden clasp closure.",
        shortDescription: "Modern tailored fit",
        price: 18900,
        categoryId: menId,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
        ],
        isFeatured: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["trousers", "tailored", "formal"],
      },
      {
        name: "Dusk Leather Tote",
        slug: "dusk-leather-tote",
        description: "Hand-stitched Italian leather tote with brushed gold hardware. Spacious interior with organizer pockets.",
        shortDescription: "Italian leather craftsmanship",
        price: 39900,
        categoryId: accessoriesId,
        images: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        ],
        isFeatured: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["bag", "leather", "tote"],
      },
      {
        name: "Horizon Minimalist Watch",
        slug: "horizon-minimalist-watch",
        description: "Swiss movement timepiece with sapphire crystal face. Brushed rose gold case with Italian leather strap.",
        shortDescription: "Swiss precision, minimal design",
        price: 59900,
        categoryId: accessoriesId,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        ],
        isFeatured: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["watch", "minimalist", "swiss"],
      },
      {
        name: "Void Essential Tee",
        slug: "void-essential-tee",
        description: "Premium Pima cotton t-shirt with perfect weight and drape. Signature fit that flatters without clinging.",
        shortDescription: "Perfect everyday essential",
        price: 6900,
        categoryId: newArrivalsId,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        ],
        isFeatured: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["tee", "essential", "cotton"],
      },
      {
        name: "Solstice Silk Scarf",
        slug: "solstice-silk-scarf",
        description: "Hand-rolled silk scarf with abstract geometric print. Versatile accessory for neck, hair, or bag.",
        shortDescription: "Artisanal silk accessory",
        price: 12900,
        categoryId: accessoriesId,
        images: [
          "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
        ],
        isFeatured: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        tags: ["scarf", "silk", "accessory"],
      },
    ];

    for (const product of products) {
      const productId = await ctx.db.insert("products", product);
      await ctx.db.insert("inventory", {
        productId,
        quantity: Math.floor(Math.random() * 50) + 10,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        updatedAt: now,
      });
    }

    await ctx.db.insert("heroSlides", {
      title: "New Season",
      subtitle: "Discover the Autumn/Winter Collection",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600",
      buttonText: "Shop Now",
      buttonLink: "/products",
      order: 1,
      isActive: true,
    });

    await ctx.db.insert("heroSlides", {
      title: "Beyond Ordinary",
      subtitle: "Crafted for those who dare to stand out",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600",
      buttonText: "Explore",
      buttonLink: "/products?category=new-arrivals",
      order: 2,
      isActive: true,
    });

    await ctx.db.insert("heroSlides", {
      title: "Timeless Elegance",
      subtitle: "Premium materials, exceptional craftsmanship",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600",
      buttonText: "View Collection",
      buttonLink: "/products?category=women",
      order: 3,
      isActive: true,
    });

    return { message: "Database seeded successfully" };
  },
});
