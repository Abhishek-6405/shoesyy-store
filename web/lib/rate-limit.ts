import { createHash } from "crypto";

const windowMs = 15 * 60 * 1000;
const buckets = new Map<string, { count: number; expires: number }>();

export function clientIp(headers: Record<string, string | string[] | undefined>) {
  const value = headers["x-forwarded-for"];
  return (Array.isArray(value) ? value[0] : value)?.split(",")[0].trim() || "unknown";
}

// Per-process abuse protection, not a distributed quota. Vercel supplies the IP header.
export function rateLimit(scope: "login" | "register", identity: string) {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.expires <= now) buckets.delete(key);
  });
  const key = createHash("sha256").update(`${scope}:${identity}`).digest("hex");
  const existing = buckets.get(key);
  const retryAfter = Math.ceil(((existing?.expires || now + windowMs) - now) / 1000);
  if (!existing && buckets.size >= 10000) return { allowed: false, retryAfter };
  const bucket = existing || { count: 0, expires: now + windowMs };
  bucket.count++;
  buckets.set(key, bucket);
  return { allowed: bucket.count <= (scope === "login" ? 10 : 5), retryAfter };
}
