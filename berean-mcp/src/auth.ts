/**
 * Optional API-key gate for self-hosted deployments.
 *
 * Off by default: when no API_KEY secret is set, the API is public (as on the
 * public demo). When `wrangler secret put API_KEY` sets one, every request to
 * /mcp and /tools/* must present it. Health checks, the docs pages and the
 * Explorer page itself stay public; note that the Explorer's own tool calls
 * do not send a key, so it cannot load results on a key-protected deployment.
 *
 * Accepted forms, in order of preference:
 *   Authorization: Bearer <key>    (also a bare Authorization: <key>)
 *   x-api-key: <key>
 *   ?key=<key>                     (last resort; query strings end up in logs)
 */
import { Env } from "./types.js";

function presentedKey(request: Request, url: URL): string {
  const authorization = request.headers.get("Authorization")?.trim() ?? "";
  if (authorization) {
    return authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : authorization;
  }
  return (request.headers.get("x-api-key") ?? url.searchParams.get("key") ?? "").trim();
}

/** Compares in time independent of where the strings differ. */
function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

/** True when the API is public (no key configured) or the request carries the configured key. */
export function isAuthorized(request: Request, url: URL, env: Env): boolean {
  const expected = env.API_KEY?.trim();
  if (!expected) return true;
  return constantTimeEqual(presentedKey(request, url), expected);
}
