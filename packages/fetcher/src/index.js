/**
 * Core news fetcher — calls RSS feeds and optionally the Medialyst API.
 * Returns a filtered, scored, deduplicated array of NewsItem objects.
 *
 * NewsItem shape:
 * {
 *   id: string          // sha1-hex of url
 *   title: string
 *   summary: string
 *   url: string
 *   source: string      // feed hostname
 *   category: string    // Tech | AI | Environment | Malaysia | Nature | Science
 *   publishedAt: string // ISO 8601
 *   positiveScore: number  // 0–100
 *   isoDate: string
 * }
 */

import Parser from "rss-parser";
import { createHash } from "crypto";
import { MONITOR_CONFIG } from "./config.js";

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "newsjack-monitor/1.0 (+https://github.com/elvisun/newsjack)" },
});

/** Stable short ID from a URL */
function hashId(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 12);
}

/** Lowercase text for matching */
function lc(s = "") {
  return s.toLowerCase();
}

/**
 * Returns true if the item should be excluded (matches any negative signal).
 */
function isNegative(item) {
  const text = lc(`${item.title} ${item.contentSnippet || item.summary || ""}`);
  return MONITOR_CONFIG.negativeSignals.some((sig) => text.includes(lc(sig)));
}

/**
 * Returns a 0–100 positivity score based on positive signal matches.
 */
function positiveScore(item) {
  const text = lc(`${item.title} ${item.contentSnippet || item.summary || ""}`);
  const hits = MONITOR_CONFIG.positiveSignals.filter((sig) => text.includes(lc(sig)));
  if (hits.length < 2) return Math.min(33, hits.length * 16);
  return Math.min(100, Math.round((hits.length / 4) * 100));
}

/**
 * Fetch a single RSS feed and return normalised items.
 * Silently skips feeds that are unreachable.
 */
async function fetchFeed({ url, category }) {
  try {
    const feed = await parser.parseURL(url);
    const source = new URL(url).hostname.replace(/^www\./, "");
    return feed.items.slice(0, 20).map((item) => ({
      id: hashId(item.link || item.guid || item.title),
      title: item.title?.trim() ?? "(no title)",
      summary: (item.contentSnippet || item.summary || "").slice(0, 300).trim(),
      url: item.link || item.guid || "",
      source,
      category,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      positiveScore: positiveScore(item),
      _negative: isNegative(item),
    }));
  } catch {
    // Feed unreachable — skip silently
    return [];
  }
}

/**
 * Optionally fetch from Medialyst REST API if MEDIALYST_API_KEY is set.
 * Mirrors the newsjack news-search skill behaviour.
 */
async function fetchMedialyst() {
  const key = process.env.MEDIALYST_API_KEY;
  const base = process.env.MEDIALYST_API_BASE || "https://medialyst.ai/api";
  const path = process.env.MEDIALYST_NEWS_PATH || "/v1/news/search";

  if (!key) return [];

  const results = [];
  for (const topic of MONITOR_CONFIG.topics) {
    try {
      const { default: fetch } = await import("node-fetch");
      const resp = await fetch(`${base}${path}?q=${encodeURIComponent(topic)}&limit=10`, {
        headers: { Authorization: `Bearer ${key}`, "User-Agent": "newsjack-monitor/1.0" },
      });
      if (!resp.ok) continue;
      const json = await resp.json();
      const articles = json.articles || json.results || json.items || [];
      for (const a of articles) {
        const category =
          MONITOR_CONFIG.categoryMap[topic] ||
          topic.charAt(0).toUpperCase() + topic.slice(1);
        const item = {
          title: a.title || "",
          contentSnippet: a.description || a.summary || "",
        };
        if (isNegative(item)) continue;
        results.push({
          id: hashId(a.url || a.link || a.title),
          title: (a.title || "").trim(),
          summary: (a.description || a.summary || "").slice(0, 300).trim(),
          url: a.url || a.link || "",
          source: a.source?.name || new URL(a.url || "https://medialyst.ai").hostname,
          category,
          publishedAt: a.published_at || a.publishedAt || new Date().toISOString(),
          positiveScore: positiveScore(item),
        });
      }
    } catch {
      // Skip this topic on error
    }
  }
  return results;
}

/**
 * Main fetch function.
 * Fetches all configured RSS feeds + optional Medialyst,
 * filters, deduplicates, and sorts by positiveScore desc then date desc.
 *
 * @returns {Promise<{items: NewsItem[], fetchedAt: string, sources: string[]}>}
 */
export async function fetchNews() {
  // Fetch all RSS feeds in parallel
  const feedResults = await Promise.all(MONITOR_CONFIG.rssFeeds.map(fetchFeed));
  const rssItems = feedResults.flat();

  // Optionally enrich with Medialyst
  const medialystItems = await fetchMedialyst();

  // Merge
  const all = [...rssItems, ...medialystItems];

  // Deduplicate by id
  const seen = new Set();
  const unique = all.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Filter out negative items AND zero-signal items
  const filtered = unique.filter((item) => !item._negative && item.positiveScore >= 16);

  // Sort: positive-first, then newest
  filtered.sort((a, b) => {
    if (b.positiveScore !== a.positiveScore) return b.positiveScore - a.positiveScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Clean internal fields
  const items = filtered.map(({ _negative, ...rest }) => rest);

  const sources = [...new Set(items.map((i) => i.source))].sort();

  return {
    items,
    fetchedAt: new Date().toISOString(),
    sources,
    totalCount: items.length,
  };
}
