/**
 * Minimal browser-global shims needed by sql.js (Emscripten) and the MCP SDK
 * inside a Cloudflare Worker. Import this module before anything that loads sql.js.
 */
const g = globalThis as unknown as { location?: { href: string }; self?: unknown };

if (typeof g.location === "undefined") {
  g.location = { href: "http://localhost/" };
}
if (typeof g.self === "undefined") {
  g.self = globalThis;
}

export {};
