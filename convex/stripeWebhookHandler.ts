"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const processWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Webhook signature verification failed");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === "paid" && session.metadata?.orderId) {
          const orderId = session.metadata.orderId as Id<"orders">;
          
          await ctx.runMutation(internal.paymentsHelpers.confirmPayment, {
            orderId,
            stripePaymentIntentId: (session.payment_intent as string) || "",
          });

          console.log(`Order ${orderId} confirmed via webhook`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.orderId) {
          const orderId = session.metadata.orderId as Id<"orders">;
          
          await ctx.runMutation(internal.paymentsHelpers.cancelPendingOrder, {
            orderId,
          });

          console.log(`Order ${orderId} cancelled - session expired`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.orderId) {
          const orderId = paymentIntent.metadata.orderId as Id<"orders">;
          
          await ctx.runMutation(internal.paymentsHelpers.cancelPendingOrder, {
            orderId,
          });

          console.log(`Order ${orderId} cancelled - payment failed`);
        }
        break;
      }
    }
  },
});
