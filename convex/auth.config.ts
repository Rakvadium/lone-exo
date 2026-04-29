export default {
  providers: [
    {
      // This must match the JWT issuer from @convex-dev/auth
      domain: process.env.NEXT_CONVEX_SITE_URL ?? "https://agreeable-mastiff-181.convex.site",
      applicationID: "convex",
    },
  ],
};
