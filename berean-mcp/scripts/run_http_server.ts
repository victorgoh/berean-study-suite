#!/usr/bin/env tsx
import http from "node:http";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import worker from "../src/index.js";
import { Env } from "../src/types.js";

const PORT = parseInt(process.env.PORT || "7860", 10);
const HOST = "0.0.0.0";

function createMockR2(localDataDir: string, serverDataDir: string) {
  return {
    async get(key: string) {
      const p1 = path.join(localDataDir, key);
      try {
        const data = await fs.readFile(p1);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          },
          async text() {
            return data.toString("utf-8");
          }
        };
      } catch (_) {}

      const p2 = path.join(serverDataDir, key);
      try {
        const data = await fs.readFile(p2);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          },
          async text() {
            return data.toString("utf-8");
          }
        };
      } catch (_) {}

      return null;
    }
  } as any;
}

const localDataDir = process.env.DATA_DIR || process.env.BIBLEMATE_DATA || path.join(os.homedir(), "biblemate", "data");
const serverDataDir = path.join(process.cwd());
const env: Env = {
  BIBLEMATE_DATA: createMockR2(localDataDir, serverDataDir),
  API_KEY: process.env.API_KEY
};
const ctx = { waitUntil: (p: any) => p } as any;

const server = http.createServer(async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || "/", `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    let body: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined
    });

    const response = await worker.fetch(request, env, ctx);

    res.statusCode = response.status;
    response.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err: any) {
    console.error("HTTP Server Error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log("==================================================");
  console.log(`🚀 Berean MCP HTTP Server running at http://${HOST}:${PORT}`);
  console.log(`   MCP Endpoint: http://${HOST}:${PORT}/mcp`);
  console.log(`   Health Check: http://${HOST}:${PORT}/health`);
  console.log(`   Data Directory: ${localDataDir}`);
  console.log("==================================================");
});
