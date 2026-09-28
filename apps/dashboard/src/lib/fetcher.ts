/**
 * News fetcher — runs in both Vercel SSR and local Node.
 * No file I/O; returns data directly.
 */

import Parser from "rss-parser";
import { createHash } from "crypto";
import { MONITOR_CONFIG } from "./config";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  positiveScore: number;
}

export interface NewsResult {
  items: NewsItem[];
  fetchedAt: string;
  sources: string[];
  totalCount: number;
}

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "newsjack-monitor/1.0" },
});

function hashId(s: string): string {
  return createHash("sha1").update(s).digest("hex").slice(0, 12);
}

function lc(s = ""): string {
  return s.toLowerCase();
}

function isNegative(title: string, snippet: string): boolean {
  const text = lc(`${title} ${snippet}`);
  return MONITOR_CONFIG.negativeSignals.some((sig) => text.includes(lc(sig)));
}

function scorePositive(title: string, snippet: string): number {
  const text = lc(`${title} ${snippet}`);
  const hits = MONITOR_CONFIG.positiveSignals.filter((sig) =>
    text.includes(lc(sig))
  );
  // Need at least 2 signal hits to score above 0; cap at 100
  if (hits.length < 2) return Math.min(33, hits.length * 16);
  return Math.min(100, Math.round((hits.length / 4) * 100));
}

async function fetchFeed(url: string, category: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const source = new URL(url).hostname.replace(/^www\./, "");
    const items: NewsItem[] = [];
    for (const item of feed.items.slice(0, 20)) {
      const title = item.title?.trim() ?? "";
      const snippet = (item.contentSnippet || item.summary || "").slice(0, 300);
      if (isNegative(title, snippet)) continue;
      items.push({
        id: hashId(item.link || item.guid || title),
        title,
        summary: snippet.trim(),
        url: item.link || item.guid || "",
        source,
        category,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        positiveScore: scorePositive(title, snippet),
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchMedialyst(): Promise<NewsItem[]> {
  const key =
    typeof process !== "undefined" ? process.env.MEDIALYST_API_KEY : undefined;
  const base =
    (typeof process !== "undefined" && process.env.MEDIALYST_API_BASE) ||
    "https://medialyst.ai/api";
  const path =
    (typeof process !== "undefined" && process.env.MEDIALYST_NEWS_PATH) ||
    "/v1/news/search";

  if (!key) return [];

  const results: NewsItem[] = [];
  for (const topic of MONITOR_CONFIG.topics) {
    try {
      const resp = await fetch(
        `${base}${path}?q=${encodeURIComponent(topic)}&limit=10`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      if (!resp.ok) continue;
      const json: any = await resp.json();
      const articles: any[] = json.articles || json.results || json.items || [];
      for (const a of articles) {
        const title = (a.title || "").trim();
        const snippet = (a.description || a.summary || "").slice(0, 300);
        if (isNegative(title, snippet)) continue;
        const category =
          MONITOR_CONFIG.categoryMap[
            topic as keyof typeof MONITOR_CONFIG.categoryMap
          ] ||
          topic.charAt(0).toUpperCase() + topic.slice(1);
        results.push({
          id: hashId(a.url || a.link || title),
          title,
          summary: snippet.trim(),
          url: a.url || a.link || "",
          source:
            a.source?.name ||
            new URL(a.url || "https://medialyst.ai").hostname,
          category,
          publishedAt:
            a.published_at || a.publishedAt || new Date().toISOString(),
          positiveScore: scorePositive(title, snippet),
        });
      }
    } catch {
      // skip
    }
  }
  return results;
}

export async function fetchNews(): Promise<NewsResult> {
  const feedResults = await Promise.all(
    MONITOR_CONFIG.rssFeeds.map(({ url, category }) => fetchFeed(url, category))
  );
  const rssItems = feedResults.flat();
  const medialystItems = await fetchMedialyst();

  const all = [...rssItems, ...medialystItems];

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = all.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Drop items with insufficient positive signal (need at least 2 hits)
  const scored = unique.filter((item) => item.positiveScore >= 33);

  // Sort: positive-score first, then newest
  scored.sort((a, b) => {
    if (b.positiveScore !== a.positiveScore)
      return b.positiveScore - a.positiveScore;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  return {
    items: scored,
    fetchedAt: new Date().toISOString(),
    sources: [...new Set(unique.map((i) => i.source))].sort(),
    totalCount: unique.length,
  };
}
