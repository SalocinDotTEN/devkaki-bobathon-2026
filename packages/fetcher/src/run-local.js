/**
 * Local scheduled runner — runs the fetcher daily at 07:00 AM local time.
 * Keep this process running (e.g. via PM2, or the Windows Task Scheduler
 * script at scripts/register-task.ps1).
 *
 * Usage:  node src/run-local.js
 */

import cron from "node-cron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { fetchNews } from "./index.js";
import { writeFileSync, mkdirSync } from "fs";

config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../apps/dashboard/src/data"
);
const OUT_FILE = join(OUT_DIR, "news.json");

async function runFetch() {
  console.log(`[newsjack-monitor] ${new Date().toISOString()} — scheduled fetch starting…`);
  try {
    const result = await fetchNews();
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), "utf8");
    console.log(
      `[newsjack-monitor] ✓ ${result.items.length} items saved to ${OUT_FILE}`
    );
  } catch (err) {
    console.error("[newsjack-monitor] fetch failed:", err.message);
  }
}

// Run immediately on startup so you see results right away
runFetch();

// Then run every day at 07:00 AM local time
cron.schedule("0 7 * * *", () => {
  runFetch();
});

console.log("[newsjack-monitor] scheduler started — daily run at 07:00 AM.");
console.log("[newsjack-monitor] Press Ctrl+C to stop.");
