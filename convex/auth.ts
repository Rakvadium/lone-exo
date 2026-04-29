import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

const ProfileSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export default Password({
  profile(params) {
    const parsed = ProfileSchema.safeParse(params);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.format());
    }
    return {
      email: parsed.data.email,
    };
  },
  validatePasswordRequirements: (password: string) => {
    if (password.length < 8 || !/\d/.test(password)) {
      throw new ConvexError("Password must be at least 8 characters with a number");
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Apple({
      profile: (appleInfo) => {
        const name = appleInfo.user
          ? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
          : undefined;
        return {
          id: appleInfo.sub,
          name: name,
          email: appleInfo.email,
        };
      },
    }),
    Password({ reset: ResendOTPPasswordReset }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (user && !user.role) {
        await ctx.db.patch(userId, {
          role: "customer",
          createdAt: Date.now(),
        });
      }
    },
    async redirect({ redirectTo }) {
      const siteUrl = process.env.SITE_URL || "http://localhost:3000";
      if (redirectTo) {
        if (redirectTo.startsWith("http")) {
          return redirectTo;
        }
        return `${siteUrl}${redirectTo.startsWith("/") ? "" : "/"}${redirectTo}`;
      }
      return siteUrl;
    },
  },
});
