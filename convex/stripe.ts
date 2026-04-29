import { action, query } from "./_generated/server";
import { components } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const stripeClient = new StripeSubscriptions(components.stripe, {});

export const createCheckoutSession = action({
  args: {
    orderId: v.id("orders"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    const order = await ctx.runQuery(components.stripe.public.getCustomer, {
      stripeCustomerId: customer.customerId,
    });

    return await stripeClient.createCheckoutSession(ctx, {
      priceId: "price_placeholder",
      customerId: customer.customerId,
      mode: "payment",
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      paymentIntentMetadata: { 
        userId: identity.subject,
        orderId: args.orderId,
      },
    });
  },
});

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.runQuery(components.stripe.public.listPaymentsByUserId, {
      userId: userId,
    });
  },
});

export const createCustomerPortal = action({
  args: {
    returnUrl: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: args.returnUrl,
    });
  },
});
