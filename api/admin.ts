import { TRPCError } from "@trpc/server";
import { publicQuery } from "./middleware";
import { getAdminFromRequest } from "./lib/admin-auth";

export const adminQuery = publicQuery.use(async ({ ctx, next }) => {
  const admin = await getAdminFromRequest(ctx.req);
  if (!admin) throw new TRPCError({ code: "UNAUTHORIZED", message: "Требуется вход администратора" });
  return next({ ctx: { ...ctx, admin } });
});
