// Polyfill self.location for Emscripten / sql.js in Cloudflare Worker environment
if (typeof (globalThis as any).location === "undefined") {
  (globalThis as any).location = { href: "http://localhost/" };
}
if (typeof (globalThis as any).self === "undefined") {
  (globalThis as any).self = globalThis;
}

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
// @ts-ignore
import sqlWasm from "sql.js/dist/sql-wasm.wasm";
import { Env } from "../types.js";

let SQL: SqlJsStatic | null = null;
const dbCache = new Map<string, { db: Database; lastUsed: number }>();

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!SQL) {
    try {
      if (sqlWasm) {
        SQL = await initSqlJs({
          instantiateWasm(imports, successCallback) {
            try {
              const instance = new WebAssembly.Instance(sqlWasm as any, imports);
              (successCallback as any)(instance, sqlWasm);
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
    if (!r2Bucket) {
      return { db: null, error: "R2 bucket binding (BIBLEMATE_DATA / BEREAN_DATA) is undefined in Worker environment." };
    }

    // Fetch SQLite binary from Cloudflare R2
    const object = await r2Bucket.get(r2Key);
    if (!object) {
      return { db: null, error: `R2 Object key '${r2Key}' returned null from bucket.` };
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

    const arrayBuffer = await object.arrayBuffer();
    const sql = await getSqlJs();
    const db = new sql.Database(new Uint8Array(arrayBuffer));

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
