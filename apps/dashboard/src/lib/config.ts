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
    // Science & discovery
    "breakthrough","discovery","found","reveals","study","new research",
    "scientists","researchers","scientists discover","findings","published",
    "new species","first ever","world first","rare","unique","remarkable",
    "milestone","record","achievement","advance","innovate","innovation",
    // Positive outcomes
    "success","growth","improve","benefit","award","grant","hope",
    "heal","revive","thrive","flourish","restore","recover","protect",
    "solution","progress","potential","promising","effective","works",
    // Environment & nature (neutral-positive framing)
    "conservation","biodiversity","renewable","sustainable","clean energy",
    "electric","climate solution","rewilding","habitat","ecosystem","species",
    "nature","wildlife","ocean","forest","planet","earth","animal",
    "plant","bird","tree","river","reef","coral","seed","soil",
    // Tech & AI (neutral-positive)
    "launch","release","new","tool","model","open source","platform",
    "collaboration","research","test","experiment","telescope","robot",
    "quantum","space","nasa","mission","satellite","gene","dna","cell",
    // Malaysia & local positive
    "malaysia","initiative","development","community","education","economy",
    "transformation","achievement","recognition","invest","partnership",
  ],

  negativeSignals: [
    // War & conflict
    "war","warfare","military strike","airstrike","bombing","missile",
    "explosion","attack","conflict","battle","ceasefire","casualt",
    "death toll","killed","soldiers","troops",
    // Politics
    "election fraud","political scandal","corruption","impeach","sanction",
    "parliament row","cabinet reshuffle","party leader","opposition",
    "protest violence","riot","insurgency","terrorism","extremist",
    "propaganda","geopolit","massacre","assassination","coup","siege",
    // Health doom / negative medical
    "alzheimer","dementia","cancer risk","linked to faster","may persist",
    "chronic pain","overdose","opioid","mental illness worsens",
    // Environmental doom framing
    "no plan","languished","still no","failed to","aren't as protected",
    "finally slowing","facing extinction","can't save","too late",
    // Scary / negative science
    "nightmare","tearing apart","misread","popping into existence",
    "nanoparticles","lie detector","organ limits","bizarre","monster",
    "abused power","summoned","banned renewables",
    // Accidents, crime, negative events
    "collision","crash","maut","nahas","disemadikan","salah guna kuasa",
    "rogue agent","pauses training","lawsuit","die-off","havoc",
    "drives me nuts","faces an even bigger","era of cheap","hurricane",
    "sardine","uncertainty after","breaking records","communication problems",
    "falls 30%","revived","consumer lawsuit","train collision",
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
