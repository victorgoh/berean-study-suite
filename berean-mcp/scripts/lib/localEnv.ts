/**
 * Local (Node) stand-in for the Worker's R2 data bucket.
 *
 * The Worker reads every SQLite/JSON resource from the BIBLEMATE_DATA R2 bucket.
 * Local runners and tests use this read-only, filesystem-backed bucket instead,
 * which keeps Node-only file access out of src/.
 *
 * A key such as "bibles/BSB.bible" is looked up in each directory below, in order:
 *   $DATA_DIR, $BIBLEMATE_DATA, ~/biblemate/data, ./data, ../data,
 *   ~/.biblemate/data, ~/berean/data, and . (for keys like data/lookup/*.json)
 * Lexicon files are also tried by basename under each directory's lexicons/.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Env } from "../../src/types.js";

export function localDataDirs(): string[] {
  const home = os.homedir();
  const dirs = [
    process.env.DATA_DIR,
    process.env.BIBLEMATE_DATA,
    path.join(home, "biblemate", "data"),
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "..", "data"),
    path.join(home, ".biblemate", "data"),
    path.join(home, "berean", "data"),
    process.cwd()
  ].filter((d): d is string => Boolean(d));
  return [...new Set(dirs)];
}

function candidatePaths(key: string, dirs: string[]): string[] {
  const paths = dirs.map((dir) => path.join(dir, key));
  for (const dir of dirs) paths.push(path.join(dir, "lexicons", path.basename(key)));
  return paths;
}

async function readFirst(paths: string[]): Promise<Buffer | null> {
  for (const p of paths) {
    try {
      return await fs.readFile(p);
    } catch {
      // try the next location
    }
  }
  return null;
}

/** Read-only R2Bucket look-alike covering the calls src/ makes (get, head). */
export function createLocalBucket(dirs: string[] = localDataDirs()): R2Bucket {
  const bucket = {
    async get(key: string) {
      const data = await readFirst(candidatePaths(key, dirs));
      if (!data) return null;
      return {
        key,
        size: data.byteLength,
        arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
        text: async () => data.toString("utf-8"),
        json: async () => JSON.parse(data.toString("utf-8"))
      };
    },
    async head(key: string) {
      const data = await readFirst(candidatePaths(key, dirs));
      return data ? { key, size: data.byteLength } : null;
    }
  };
  return bucket as unknown as R2Bucket;
}

/** An Env wired to local data; pass overrides for D1 mocks, profile, limiters, etc. */
export function createLocalEnv(overrides: Partial<Env> = {}): Env {
  return { BIBLEMATE_DATA: createLocalBucket(), ...overrides } as Env;
}
