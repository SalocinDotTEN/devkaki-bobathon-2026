/**
 * Shared monitor configuration — embedded directly in the Astro app
 * so it works in both SSR (Vercel) and the local Node runner.
 */

export const MONITOR_CONFIG = {
  topics: [
    "technology",
    "artificial intelligence",
    "environment",
    "Malaysia",
    "local news Malaysia",
    "nature",
    "science",
  ],

  categoryMap: {
    technology: "Tech",
    "artificial intelligence": "AI",
    environment: "Environment",
    Malaysia: "Malaysia",
    "local news Malaysia": "Malaysia",
    nature: "Nature",
    science: "Science",
  },

  positiveSignals: [
    "breakthrough","discovery","innovation","launch","success","growth",
    "milestone","record","achievement","advance","improve","protect",
    "restore","recover","renewable","sustainable","solution","progress",
    "benefit","award","grant","collaboration","research","study finds",
    "new species","conservation","clean energy","electric","climate solution",
    "biodiversity","first ever","world first","record-breaking","hope",
    "heal","revive","thrive","flourish",
  ],

  negativeSignals: [
    "war","warfare","military strike","airstrike","bombing","missile",
    "explosion","attack","conflict","battle","ceasefire","casualt",
    "death toll","killed","soldiers","troops","election fraud",
    "political scandal","corruption","impeach","sanction","parliament row",
    "cabinet reshuffle","party leader","opposition","protest violence",
    "riot","insurgency","terrorism","extremist","propaganda","geopolit",
    "massacre","assassination","coup","siege",
  ],

  rssFeeds: [
    // Tech & AI
    { url: "https://feeds.feedburner.com/TechCrunch", category: "Tech" },
    { url: "https://www.wired.com/feed/rss", category: "Tech" },
    { url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech" },
    { url: "https://venturebeat.com/feed/", category: "AI" },
    { url: "https://www.technologyreview.com/feed/", category: "Tech" },
    // Science & Nature
    { url: "https://www.sciencedaily.com/rss/all.xml", category: "Science" },
    { url: "https://www.newscientist.com/feed/home/", category: "Science" },
    { url: "https://feeds.nationalgeographic.com/ng/News/News_Main", category: "Nature" },
    { url: "https://www.nature.com/nature.rss", category: "Science" },
    // Environment
    { url: "https://www.theguardian.com/environment/rss", category: "Environment" },
    { url: "https://grist.org/feed/", category: "Environment" },
    { url: "https://e360.yale.edu/feed", category: "Environment" },
    // Malaysia / Local
    { url: "https://www.malaymail.com/feed", category: "Malaysia" },
    { url: "https://www.freemalaysiatoday.com/feed/", category: "Malaysia" },
    { url: "https://www.thestar.com.my/rss/News/Nation", category: "Malaysia" },
    { url: "https://www.nst.com.my/rss/latest", category: "Malaysia" },
  ],
};
