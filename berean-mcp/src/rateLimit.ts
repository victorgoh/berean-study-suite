/**
 * Anonymous rate limiting for the public API.
 *
 * Only real work is metered: each REST tool request and each MCP `tools/call`.
 * MCP protocol chatter (initialize, notifications, tools/list, prompts/list,
 * resources/list, ping) is covered only by the coarse burst limiter, so a client
 * handshake no longer consumes the tool-call budget.
 *
 * Limits are configured per binding in wrangler.jsonc (see wrangler.jsonc.example).
 * All bindings are optional; when absent (local runs), nothing is limited.
 */
import { Env } from "./types.js";

export type ToolCost = "standard" | "expensive";

/** Tools that load large databases (commentaries, search indexes) or bundle several lookups. */
const EXPENSIVE_TOOL_PATTERN =
  /(?:commentary|search|study_pack|devotional|sermon|exegesis|word_study|topic_study|prayer|covenant|interlinear|septuagint|compare)/i;

/** Retry-After seconds, matched to each binding's window. */
const RETRY_AFTER = { burst: 10, standard: 60, expensive: 60 } as const;

export function toolCost(toolName: string): ToolCost {
  return EXPENSIVE_TOOL_PATTERN.test(toolName) ? "expensive" : "standard";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Returns the tool name of every `tools/call` in a JSON-RPC message or batch.
 * A malformed `tools/call` (no name) is still counted, as "unknown".
 */
export function toolCallsInJsonRpc(body: unknown): string[] {
  const messages = Array.isArray(body) ? body : [body];
  const names: string[] = [];
  for (const message of messages) {
    if (!isRecord(message) || message.method !== "tools/call") continue;
    const params = message.params;
    names.push(isRecord(params) && typeof params.name === "string" ? params.name : "unknown");
  }
  return names;
}

export interface RateLimitDecision {
  limiter: "burst" | ToolCost;
  retryAfter: number;
}

/**
 * Applies the burst limiter once per API request, then one standard/expensive
 * check per tool call. Returns the first limit hit, or null when allowed.
 */
export async function checkRateLimits(
  env: Env,
  clientKey: string,
  toolNames: readonly string[]
): Promise<RateLimitDecision | null> {
  try {
    if (env.MCP_BURST_LIMITER) {
      const burst = await env.MCP_BURST_LIMITER.limit({ key: `${clientKey}:burst` });
      if (!burst.success) return { limiter: "burst", retryAfter: RETRY_AFTER.burst };
    }

    for (const name of toolNames) {
      const cost = toolCost(name);
      const limiter = cost === "expensive" ? env.MCP_EXPENSIVE_LIMITER : env.MCP_RATE_LIMITER;
      if (!limiter) continue;
      const result = await limiter.limit({ key: `${clientKey}:${cost}` });
      if (!result.success) return { limiter: cost, retryAfter: RETRY_AFTER[cost] };
    }
  } catch (error) {
    // Keep the service available if a binding is temporarily unavailable;
    // Cloudflare's platform protections remain an outer safeguard.
    console.error("Rate-limit binding error:", error);
  }
  return null;
}
