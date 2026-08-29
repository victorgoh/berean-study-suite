/**
 * Test loading large SQLite databases through sql.js to measure memory usage
 * and verify whether dictionary.data (56 MB) and encyclopedia.data (198 MB)
 * can be loaded without crashing.
 * 
 * Usage: npx tsx scripts/test_large_db_memory.ts
 */
import fs from "fs/promises";
import path from "path";
import os from "os";
import initSqlJs from "sql.js";

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function reportMemory(label: string): void {
  const mem = process.memoryUsage();
  console.log(`  [Memory @ ${label}]`);
  console.log(`    RSS:       ${formatMB(mem.rss)}`);
  console.log(`    Heap Used: ${formatMB(mem.heapUsed)}`);
  console.log(`    Heap Total:${formatMB(mem.heapTotal)}`);
  console.log(`    External:  ${formatMB(mem.external)}`);
  console.log(`    ArrayBuf:  ${formatMB(mem.arrayBuffers)}`);
  console.log(`    TOTAL (RSS): ${formatMB(mem.rss)}`);
}

async function testLoadDatabase(filePath: string, testQuery: string, testParams: any[]): Promise<boolean> {
  const filename = path.basename(filePath);
  console.log(`\n${"=".repeat(60)}`);

  // Check file exists and size
  try {
    const stat = await fs.stat(filePath);
    console.log(`Testing: ${filename} (${formatMB(stat.size)})`);
  } catch {
    console.log(`⏭️  Skipping ${filename} — file not found at ${filePath}`);
    return false;
  }

  reportMemory("before loading");

  // Step 1: Read file into ArrayBuffer
  const t0 = Date.now();
  let fileData: Buffer;
  try {
    fileData = await fs.readFile(filePath);
    console.log(`  ✅ File read in ${Date.now() - t0}ms`);
  } catch (e: any) {
    console.error(`  ❌ File read failed: ${e.message}`);
    return false;
  }

  reportMemory("after file read");

  // Step 2: Initialize sql.js
  const t1 = Date.now();
  let SQL;
  try {
    SQL = await initSqlJs();
    console.log(`  ✅ sql.js initialized in ${Date.now() - t1}ms`);
  } catch (e: any) {
    console.error(`  ❌ sql.js init failed: ${e.message}`);
    return false;
  }

  // Step 3: Create Database from buffer (this is the critical step)
  const t2 = Date.now();
  let db;
  try {
    db = new SQL.Database(new Uint8Array(fileData.buffer, fileData.byteOffset, fileData.byteLength));
    console.log(`  ✅ Database opened in ${Date.now() - t2}ms`);
  } catch (e: any) {
    console.error(`  ❌ Database open FAILED: ${e.message}`);
    return false;
  }

  reportMemory("after db open");

  // Step 4: Run a test query
  const t3 = Date.now();
  try {
    const stmt = db.prepare(testQuery);
    if (testParams.length > 0) {
      stmt.bind(testParams);
    }

    let rowCount = 0;
    let sampleRow: any = null;
    while (stmt.step()) {
      rowCount++;
      if (rowCount === 1) {
        sampleRow = stmt.getAsObject();
      }
      if (rowCount >= 5) break; // Only fetch a few rows
    }
    stmt.free();

    console.log(`  ✅ Query completed in ${Date.now() - t3}ms — ${rowCount} rows fetched`);
    if (sampleRow) {
      const keys = Object.keys(sampleRow);
      const preview = keys.map(k => `${k}: ${String(sampleRow[k]).slice(0, 60)}`).join(" | ");
      console.log(`  📋 Sample row: ${preview}`);
    }
  } catch (e: any) {
    console.error(`  ❌ Query FAILED: ${e.message}`);
    db.close();
    return false;
  }

  reportMemory("after query");

  // Step 5: Close and free
  db.close();
  // @ts-ignore
  fileData = null!;

  // Force GC if available
  if (global.gc) global.gc();

  reportMemory("after close + GC");

  return true;
}

async function main() {
  const dataDir = path.join(os.homedir(), "biblemate", "data");

  console.log("🧪 Berean Large Database Memory Test");
  console.log(`   Data directory: ${dataDir}`);
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform} ${process.arch}`);
  reportMemory("baseline");

  // Test 1: dictionary.data (56 MB) — the borderline case
  const dictPath = path.join(dataDir, "data", "dictionary.data");
  const dictOk = await testLoadDatabase(
    dictPath,
    "SELECT name FROM sqlite_master WHERE type='table' LIMIT 10",
    []
  );

  // If dictionary loaded, try a real content query
  if (dictOk) {
    console.log("\n  📖 Running content query on dictionary.data...");
    try {
      const fileData = await fs.readFile(dictPath);
      const SQL = await initSqlJs();
      const db = new SQL.Database(new Uint8Array(fileData.buffer, fileData.byteOffset, fileData.byteLength));
      
      // List tables first
      const tablesStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
      const tables: string[] = [];
      while (tablesStmt.step()) {
        tables.push((tablesStmt.getAsObject() as any).name);
      }
      tablesStmt.free();
      console.log(`  📋 Tables found: ${tables.join(", ")}`);

      // Try querying first table for a sample entry
      if (tables.length > 0) {
        const firstTable = tables[0];
        const colStmt = db.prepare(`PRAGMA table_info(${firstTable})`);
        const cols: string[] = [];
        while (colStmt.step()) {
          cols.push((colStmt.getAsObject() as any).name);
        }
        colStmt.free();
        console.log(`  📋 Columns in '${firstTable}': ${cols.join(", ")}`);

        const sampleStmt = db.prepare(`SELECT * FROM ${firstTable} LIMIT 1`);
        if (sampleStmt.step()) {
          const row = sampleStmt.getAsObject();
          const preview = Object.entries(row).map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`).join("\n      ");
          console.log(`  📋 Sample entry:\n      ${preview}`);
        }
        sampleStmt.free();
      }

      db.close();
    } catch (e: any) {
      console.error(`  ❌ Content query failed: ${e.message}`);
    }
  }

  // Test 2: exlb3.data (36 MB) — should be fine
  await testLoadDatabase(
    path.join(dataDir, "data", "exlb3.data"),
    "SELECT name FROM sqlite_master WHERE type='table' LIMIT 10",
    []
  );

  // Test 3: encyclopedia.data (198 MB) — expected to be problematic
  await testLoadDatabase(
    path.join(dataDir, "data", "encyclopedia.data"),
    "SELECT name FROM sqlite_master WHERE type='table' LIMIT 10",
    []
  );

  // Test 4: morphology.sqlite (136 MB) — already "working" in prod?
  await testLoadDatabase(
    path.join(dataDir, "morphology.sqlite"),
    "SELECT * FROM morphology WHERE Book=43 AND Chapter=1 AND Verse=1 LIMIT 5",
    []
  );

  console.log(`\n${"=".repeat(60)}`);
  console.log("🏁 Memory test complete.");
  reportMemory("final");
}

main().catch(console.error);
