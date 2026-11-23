import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const COOKIE_NAME = "kt_admin";
const SESSION_HOURS = 8;
type AdminSession = { email: string; role: "admin" };

function secret() { return new TextEncoder().encode(env.appSecret); }
function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) && safeEqual(password, expectedPassword);
}

export async function createAdminSession(email: string) {
  return new SignJWT({ email, role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_HOURS}h`).sign(secret());
}

export async function getAdminFromRequest(req: Request): Promise<AdminSession | null> {
  const cookies = req.headers.get("cookie") ?? "";
  const token = cookies.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${COOKIE_NAME}=`))?.split("=")[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "admin" };
  } catch { return null; }
}

export function adminCookie(token: string) {
  const secure = env.isProduction ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
