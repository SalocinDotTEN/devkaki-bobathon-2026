# Newsjack Daily Monitor

A positive-news dashboard powered by [newsjack.sh](https://newsjack.sh), built with **Astro SSR**.

Monitors **Tech · AI · Environment · Malaysia · Nature · Science** — filters out war, conflict, and politics automatically.

---

## Built with IBM Bob

This project was designed and scaffolded entirely through a conversation with **[IBM Bob](https://www.ibm.com/products/bob)**, IBM's AI software engineer agent.

### What Bob did

| Step | What happened |
|---|---|
| **Research** | Bob fetched and read the newsjack GitHub repo (`elvisun/newsjack`), the `getting-started.md` docs, and the `.env.example` to understand the tool before writing a single line of code. |
| **Windows install** | Bob identified the correct Windows install path (no `curl \| bash` on PowerShell) and ran the PowerShell one-liner to download and execute `newsjack_windows_amd64.exe setup`, which installed the CLI and all skills into Claude Code and Codex. |
| **Architecture decision** | When asked whether this could run on a web server, Bob explained the two realistic options (serverless Vercel vs. self-hosted VPS), laid out a comparison table, and let the user choose — then built both simultaneously in one monorepo. |
| **Monorepo scaffold** | Bob created the workspace `package.json`, the `packages/fetcher` shared library, and used `npm create astro@latest` to scaffold the Astro app — resolving Windows-specific `npm install-scripts` approval issues along the way. |
| **Fetcher library** | Bob wrote [`packages/fetcher/src/index.js`](packages/fetcher/src/index.js) and [`apps/dashboard/src/lib/fetcher.ts`](apps/dashboard/src/lib/fetcher.ts): parallel RSS ingestion across 16 curated feeds, keyword-based negative filtering (war/conflict/politics excluded), positive-signal scoring (0–100 vibe score), and optional Medialyst API enrichment. |
| **Dashboard UI** | Bob built the full Astro SSR dashboard in [`apps/dashboard/src/pages/index.astro`](apps/dashboard/src/pages/index.astro): sticky header, hero stats strip, scrollable category tabs, responsive card grid with per-card vibe bars, sidebar with category breakdown and source list — all in vanilla CSS, no framework. |
| **Vercel deployment** | Bob added `@astrojs/vercel` SSR adapter, wrote `vercel.json` with a daily 07:00 UTC cron pointing at `/api/news`, and documented the required env vars. |
| **Local scheduling** | Bob wrote a `node-cron` daemon (`run-local.js`) for keeping news fresh without a cloud, and a `register-task.ps1` script to register it as a persistent Windows Task Scheduler job. |
| **Docs** | Bob wrote this README, the `.env.example`, and the Bob section you are reading now — at the user's request. |

### The prompt that started it all

```
help me install https://newsjack.sh from the github repo and setup a daily newsjack
monitoring for news from tech, ai, environment, malaysia or local news, nature, science.
gear towards positive news and avoid news about war, conflict and politics.
construct a suitable dashboard for displaying the news. try using astro framework if possible.
```

No boilerplate was copied. Bob read the upstream docs, reasoned about Windows constraints, proposed the architecture, resolved dependency issues, and produced all files in one session.

---

## Project structure

```
newsjack-monitor/
├── apps/
│   └── dashboard/          ← Astro SSR app (deploy to Vercel or run locally)
│       ├── src/
│       │   ├── lib/
│       │   │   ├── config.ts      ← topics, RSS feeds, signal lists
│       │   │   └── fetcher.ts     ← RSS + Medialyst fetcher
│       │   └── pages/
│       │       ├── index.astro    ← main dashboard
│       │       └── api/news.ts    ← JSON API + Vercel cron target
│       └── vercel.json            ← daily cron at 07:00 UTC
├── packages/
│   └── fetcher/            ← local Node.js runner (writes news.json)
│       └── src/
│           ├── config.js
│           ├── index.js
│           ├── run.js          ← single fetch (npm run fetch)
│           └── run-local.js    ← node-cron scheduler
├── scripts/
│   └── register-task.ps1   ← Windows Task Scheduler registration
├── .env.example
└── newsjack.exe             ← newsjack CLI (already installed)
```

---

## Quick start

### 1. Copy environment config

```bash
cp .env.example .env
# Edit .env — MEDIALYST_API_KEY is optional but improves results
```

### 2-A. Run locally (dev server)

```powershell
# Install dependencies
npm install

# Fetch news once and start the dev server
npm run fetch
npm run dev
# → http://localhost:4321
```

### 2-B. Local scheduled daemon (keeps news fresh daily)

```powershell
# Runs immediately then daily at 07:00 AM
npm run fetch:local --workspace=packages/fetcher
```

Or register as a **Windows Task Scheduler** task (runs even when the window is closed):

```powershell
# Run once as Administrator
PowerShell -ExecutionPolicy Bypass -File scripts\register-task.ps1
```

---

## Deploy to Vercel (Option A — serverless)

```bash
# From apps/dashboard/
npx vercel
```

The Astro SSR app runs on Vercel's edge. The `vercel.json` cron hits `/api/news` daily at 07:00 UTC, which fetches all RSS feeds (and Medialyst if configured) and caches results for 1 hour.

**Required Vercel environment variables:**

| Variable | Required | Description |
|---|---|---|
| `MEDIALYST_API_KEY` | Optional | Enables live Medialyst news search |
| `CRON_SECRET` | Recommended | Protects the cron endpoint |

Set them in the Vercel dashboard under **Settings → Environment Variables**.

---

## How filtering works

1. **RSS feeds** from 16 sources across all 6 topics are fetched in parallel.
2. **Negative filter**: any story whose title/summary matches a word from the negative-signals list (war, conflict, politics, etc.) is dropped immediately.
3. **Positive scoring**: remaining stories are scored 0–100 based on how many positive-signal keywords they contain (breakthrough, discovery, innovation…).
4. **Sort**: high-vibe stories surface first, then sorted by publish date.
5. **Medialyst** (if `MEDIALYST_API_KEY` is set): additional stories from the live news index are merged and deduplicated.

---

## Adding/removing feeds or signals

Edit [`apps/dashboard/src/lib/config.ts`](apps/dashboard/src/lib/config.ts):

- `rssFeeds` — add/remove RSS URLs and their category
- `positiveSignals` — keywords that boost a story's score
- `negativeSignals` — keywords that exclude a story entirely

---

## newsjack CLI

The `newsjack.exe` binary was installed via the Windows setup route and is also available as `newsjack` in `%USERPROFILE%\.newsjack\bin`. It gives you access to all newsjack skills directly from an agent (Claude Code, Codex, etc.).

```powershell
# Check status
newsjack auth status

# Login to Medialyst (optional, for enriched news search)
newsjack login

# Run the detector skill directly
newsjack monitor test <slug> --mock
```

