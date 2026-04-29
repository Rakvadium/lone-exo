import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// HTTP endpoint for Stripe webhooks - calls Node.js action for processing
export const handleStripeWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();

  try {
    // Call Node.js action to verify and process the webhook
    await ctx.runAction(internal.stripeWebhookHandler.processWebhook, {
      body,
      signature,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response("Webhook processing failed", { status: 400 });
  }
});
