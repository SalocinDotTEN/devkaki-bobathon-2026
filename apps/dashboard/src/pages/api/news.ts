/**
 * GET /api/news
 *
 * Returns the latest fetched news as JSON.
 * In SSR (Vercel) mode: fetches live on demand (cached by Vercel edge).
 * Called by the dashboard page and the Vercel cron job.
 */

import type { APIRoute } from "astro";
import { fetchNews } from "../../lib/fetcher";

export const prerender = false;

// Cache results for 1 hour to avoid hammering RSS feeds on every request
let cache: { data: any; at: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const GET: APIRoute = async ({ request }) => {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // Accept requests from localhost unconditionally (for local dev)
  const cronSecret = process.env.CRON_SECRET;
  const isCron = request.headers.get("x-vercel-cron") === "1";

  if (isCron && cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Serve cache if still fresh
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return new Response(JSON.stringify(cache.data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const result = await fetchNews();
    cache = { data: result, at: Date.now() };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Fetch failed", message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
