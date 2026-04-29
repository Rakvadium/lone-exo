import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export type AuthContext = QueryCtx | MutationCtx;

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAuth(ctx: AuthContext): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }
  return userId;
}

export async function getOptionalUser(ctx: AuthContext): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  return userId;
}

export async function requireOwnership<T extends { userId: Id<"users"> }>(
  ctx: AuthContext,
  document: T | null
): Promise<{ userId: Id<"users">; doc: T }> {
  const userId = await requireAuth(ctx);

  if (!document) {
    throw new AuthorizationError("Resource not found");
  }

  if (document.userId !== userId) {
    throw new AuthorizationError("Access denied");
  }

  return { userId, doc: document };
}

export async function requireAdmin(ctx: AuthContext): Promise<Id<"users">> {
  const userId = await requireAuth(ctx);
  const user = await ctx.db.get(userId);

  if (!user || user.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  return userId;
}

export async function isAdmin(ctx: AuthContext): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;

  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

export async function requireOwnershipOrAdmin<T extends { userId: Id<"users"> }>(
  ctx: AuthContext,
  document: T | null
): Promise<{ userId: Id<"users">; doc: T; isAdmin: boolean }> {
  const userId = await requireAuth(ctx);
  const user = await ctx.db.get(userId);
  const userIsAdmin = user?.role === "admin";

  if (!document) {
    throw new AuthorizationError("Resource not found");
  }

  if (document.userId !== userId && !userIsAdmin) {
    throw new AuthorizationError("Access denied");
  }

  return { userId, doc: document, isAdmin: userIsAdmin };
}
