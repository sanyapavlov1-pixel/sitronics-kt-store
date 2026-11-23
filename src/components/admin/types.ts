import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../api/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AdminProduct = RouterOutputs["admin"]["products"][number];
export type AdminCategory = RouterOutputs["admin"]["categories"][number];
export type AdminOrder = RouterOutputs["admin"]["orders"][number];
