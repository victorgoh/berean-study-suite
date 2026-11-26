import "../polyfills.js";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import { Env } from "../types.js";

/**
 * SQLite and JSON resources loaded from R2, cached per Worker isolate.
 *
 * Worker isolates have 128 MB, so at most MAX_CACHED_DATABASES databases stay
 * open, and at most one commentary (the largest files). Maps double as LRU
 * lists: a hit re-inserts the key, so the first key is always the oldest.
 *
 * Concurrent requests for the same key share one in-flight load instead of
 * downloading and parsing the file twice.
 *
 * Evicting closes the database. That is safe because services only use a
 * handle synchronously right after `getDatabase` resolves; none keep it
 * across an `await`.
 *
 * This module is Worker-only: local scripts provide an R2-shaped bucket
 * (see scripts/lib/localEnv.ts) instead of a filesystem fallback here.
 */

const MAX_CACHED_DATABASES = 2;
const MAX_CACHED_JSON = 10;
const COMMENTARY_PREFIX = "commentaries/";

export interface DatabaseResult {
  db: Database | null;
  error?: string;
}

let sqlJs: Promise<SqlJsStatic> | null = null;
const dbCache = new Map<string, Database>();
const dbLoads = new Map<string, Promise<DatabaseResult>>();
const jsonCache = new Map<string, unknown>();
const jsonLoads = new Map<string, Promise<unknown | null>>();

function bucketFor(env: Env): R2Bucket | undefined {
  return env.BIBLEMATE_DATA || env.BEREAN_DATA;
}

/** Marks a cache entry as most recently used. */
function touch<V>(cache: Map<string, V>, key: string, value: V): V {
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function getSqlJs(): Promise<SqlJsStatic> {
  sqlJs ??= (async () => {
    // Workers: the bundler provides the compiled WASM module. Node: sql.js
    // locates its own .wasm file, so the import fails and we fall through.
    const wasmModule = await import("sql.js/dist/sql-wasm.wasm").then((m) => m.default).catch(() => null);
    if (wasmModule && typeof WebAssembly !== "undefined") {
      return initSqlJs({
        instantiateWasm(imports, successCallback) {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          // Emscripten passes the module too; @types/sql.js declares only the instance.
          (successCallback as (i: WebAssembly.Instance, m: WebAssembly.Module) => void)(instance, wasmModule);
          return instance.exports;
        }
      });
    }
    return initSqlJs();
  })().catch((error) => {
    sqlJs = null; // allow a retry on the next request
    console.error("Error initializing sql.js WASM:", error);
    throw error;
  });
  return sqlJs;
}

function closeQuietly(db: Database): void {
  try {
    db.close();
  } catch {
    // already closed
  }
}

/** Frees room for one more database, keeping at most one commentary open. */
function evictFor(r2Key: string): void {
  if (r2Key.startsWith(COMMENTARY_PREFIX)) {
    for (const [key, db] of dbCache) {
      if (key.startsWith(COMMENTARY_PREFIX)) {
        closeQuietly(db);
        dbCache.delete(key);
      }
    }
  }
  while (dbCache.size >= MAX_CACHED_DATABASES) {
    const [oldestKey, oldestDb] = dbCache.entries().next().value as [string, Database];
    closeQuietly(oldestDb);
    dbCache.delete(oldestKey);
  }
}

async function loadDatabase(env: Env, r2Key: string): Promise<DatabaseResult> {
  const bucket = bucketFor(env);
  if (!bucket) {
    return { db: null, error: "Data storage is not configured." };
  }

  try {
    const object = await bucket.get(r2Key);
    if (!object) {
      return { db: null, error: `Resource '${r2Key}' is not available in storage.` };
    }
    const bytes = new Uint8Array(await object.arrayBuffer());
    const SQL = await getSqlJs();

    evictFor(r2Key);
    const db = new SQL.Database(bytes);
    dbCache.set(r2Key, db);
    return { db };
  } catch (error) {
    // Details go to the logs only; clients get a stable, non-sensitive message.
    console.error(`getDatabase failed for '${r2Key}':`, error);
    return { db: null, error: `Resource '${r2Key}' could not be opened from storage.` };
  }
}

export function getDatabase(env: Env, r2Key: string): Promise<DatabaseResult> {
  const cached = dbCache.get(r2Key);
  if (cached) return Promise.resolve({ db: touch(dbCache, r2Key, cached) });

  let load = dbLoads.get(r2Key);
  if (!load) {
    load = loadDatabase(env, r2Key).finally(() => dbLoads.delete(r2Key));
    dbLoads.set(r2Key, load);
  }
  return load;
}

async function loadJson(env: Env, r2Key: string): Promise<unknown | null> {
  const bucket = bucketFor(env);
  if (!bucket) return null;
  try {
    const object = await bucket.get(r2Key);
    if (!object) return null;
    const data: unknown = JSON.parse(await object.text());

    while (jsonCache.size >= MAX_CACHED_JSON) {
      jsonCache.delete(jsonCache.keys().next().value as string);
    }
    jsonCache.set(r2Key, data);
    return data;
  } catch (error) {
    console.error(`Error loading JSON '${r2Key}':`, error);
    return null;
  }
}

export function getJsonFromR2<T>(env: Env, r2Key: string): Promise<T | null> {
  if (jsonCache.has(r2Key)) {
    return Promise.resolve(touch(jsonCache, r2Key, jsonCache.get(r2Key)) as T);
  }
  let load = jsonLoads.get(r2Key);
  if (!load) {
    load = loadJson(env, r2Key).finally(() => jsonLoads.delete(r2Key));
    jsonLoads.set(r2Key, load);
  }
  return load as Promise<T | null>;
}
