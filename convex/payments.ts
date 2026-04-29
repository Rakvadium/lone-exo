"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { components } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";

interface OrderItem {
  productId: Id<"products">;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: Id<"orders">;
  userId: Id<"users">;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  createdAt: number;
  updatedAt: number;
}

const stripeClient = new StripeSubscriptions(components.stripe, {});

export const createCheckoutSession = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.runQuery(internal.paymentsHelpers.getOrderForCheckout, {
      orderId: args.orderId,
    }) as Order | null;

    if (!order) {
      throw new Error("Order not found");
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    const successUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/checkout/cancel`;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item: OrderItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    if (order.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: order.shipping,
        },
        quantity: 1,
      });
    }

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      customer: customer.customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: identity.subject,
        orderId: args.orderId,
      },
    });

    await ctx.runMutation(internal.paymentsHelpers.updateOrderWithSession, {
      orderId: args.orderId,
      stripeSessionId: session.id,
    });

    return { sessionId: session.id, url: session.url };
  },
});
