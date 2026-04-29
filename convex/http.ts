import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleStripeWebhook } from "./stripeWebhook";

const http = httpRouter();

// Auth routes
auth.addHttpRoutes(http);

// Stripe webhook for payment events
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: handleStripeWebhook,
});

export default http;
