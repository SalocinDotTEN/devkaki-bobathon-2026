/**
 * Local runner — fetch news once and write to ../../apps/dashboard/src/data/news.json
 * Called by: npm run fetch  (from root)
 * Also called on a schedule by run-local.js
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchNews } from "./index.js";

// Load .env from repo root
import { config } from "dotenv";
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../apps/dashboard/src/data"
);
const OUT_FILE = join(OUT_DIR, "news.json");

async function run() {
  console.log(`[newsjack-monitor] ${new Date().toISOString()} — fetching news…`);
  try {
    const result = await fetchNews();
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), "utf8");
    console.log(
      `[newsjack-monitor] ✓ wrote ${result.items.length} items to ${OUT_FILE}`
    );
  } catch (err) {
    console.error("[newsjack-monitor] fetch failed:", err.message);
    process.exit(1);
  }
}

run();
