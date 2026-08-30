// Polyfill self.location for Emscripten / sql.js in Cloudflare Worker environment
if (typeof (globalThis as any).location === "undefined") {
  (globalThis as any).location = { href: "http://localhost/" };
}
if (typeof (globalThis as any).self === "undefined") {
  (globalThis as any).self = globalThis;
}

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import { Env } from "../types.js";

let SQL: SqlJsStatic | null = null;
const dbCache = new Map<string, { db: Database; lastUsed: number }>();

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!SQL) {
    try {
      let wasmModule: any = null;
      try {
        // @ts-ignore
        wasmModule = (await import("sql.js/dist/sql-wasm.wasm")).default;
      } catch (_) {}

      if (wasmModule && typeof WebAssembly !== "undefined") {
        SQL = await initSqlJs({
          instantiateWasm(imports, successCallback) {
            try {
              const instance = new WebAssembly.Instance(wasmModule as any, imports);
              (successCallback as any)(instance, wasmModule);
              return instance.exports;
            } catch (err: any) {
              console.error("WASM instantiate error:", err);
              throw err;
            }
          }
        });
        return SQL;
      }
      SQL = await initSqlJs();
    } catch (e: any) {
      console.error("Error initializing sql.js WASM:", e?.message || e);
      throw e;
    }
  }
  return SQL;
}

export async function getDatabase(env: Env, r2Key: string): Promise<{ db: Database | null; error?: string }> {
  try {
    // Check in-memory cache first
    if (dbCache.has(r2Key)) {
      const cached = dbCache.get(r2Key)!;
      cached.lastUsed = Date.now();
      return { db: cached.db };
    }

    const r2Bucket = env.BIBLEMATE_DATA || env.BEREAN_DATA;
    let arrayBuffer: ArrayBuffer | null = null;

    if (r2Bucket) {
      // Fetch SQLite binary from Cloudflare R2
      const object = await r2Bucket.get(r2Key);
      if (!object) {
        return { db: null, error: `R2 Object key '${r2Key}' returned null from bucket.` };
      }
      arrayBuffer = await object.arrayBuffer();
    } else {
      // Fallback for local Node.js / CLI testing
      try {
        // @ts-ignore
        const fs = await import("node:fs");
        // @ts-ignore
        const path = await import("node:path");
        const localCandidates = [
          path.resolve(process.cwd(), "data", r2Key),
          path.resolve(process.cwd(), "..", "data", r2Key),
          path.resolve(process.env.HOME || "", "berean", "data", r2Key),
          path.resolve(process.env.HOME || "", ".biblemate", "data", r2Key),
          path.resolve(process.env.HOME || "", "berean", "data", "lexicons", path.basename(r2Key)),
          path.resolve(process.cwd(), "data", "lexicons", path.basename(r2Key))
        ];
        for (const candidate of localCandidates) {
          if (fs.existsSync(candidate)) {
            const buf = fs.readFileSync(candidate);
            arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            break;
          }
        }
      } catch (_) {}

      if (!arrayBuffer) {
        return { db: null, error: `Database file '${r2Key}' not found in R2 or local filesystem.` };
      }
    }

    // Evict existing commentaries or oldest DB before allocating new WASM memory
    if (r2Key.startsWith("commentaries/")) {
      for (const [key, val] of dbCache.entries()) {
        if (key.startsWith("commentaries/")) {
          try { val.db.close(); } catch (_) {}
          dbCache.delete(key);
        }
      }
    }

    if (dbCache.size >= 2) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [key, val] of dbCache.entries()) {
        if (val.lastUsed < oldestTime) {
          oldestTime = val.lastUsed;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        const old = dbCache.get(oldestKey);
        try { old?.db.close(); } catch (_) {}
        dbCache.delete(oldestKey);
      }
    }

    const sql = await getSqlJs();
    const db = new sql.Database(new Uint8Array(arrayBuffer!));

    dbCache.set(r2Key, { db, lastUsed: Date.now() });
    return { db };
  } catch (err: any) {
    return { db: null, error: `getDatabase exception for '${r2Key}': ${err?.stack || err?.message || err}` };
  }
}

const jsonCache = new Map<string, { data: any; lastUsed: number }>();

export async function getJsonFromR2<T>(env: Env, r2Key: string): Promise<T | null> {
  try {
    if (jsonCache.has(r2Key)) {
      const cached = jsonCache.get(r2Key)!;
      cached.lastUsed = Date.now();
      return cached.data as T;
    }

    const r2Bucket = env.BIBLEMATE_DATA || env.BEREAN_DATA;
    if (!r2Bucket) return null;

    const object = await r2Bucket.get(r2Key);
    if (!object) return null;

    const text = await object.text();
    const data = JSON.parse(text) as T;

    if (jsonCache.size >= 10) {
      const oldestKey = [...jsonCache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0]?.[0];
      if (oldestKey) jsonCache.delete(oldestKey);
    }

    jsonCache.set(r2Key, { data, lastUsed: Date.now() });
    return data;
  } catch (err) {
    console.error(`Error loading JSON '${r2Key}':`, err);
    return null;
  }
}
