export interface RSSSourceConfig {
  id: string;
  name: string;
  domain: string;
  biasCategory: 'Left' | 'Lean_Left' | 'Center' | 'Lean_Right' | 'Right';
  rssUrl: string;
  category: 'Politics' | 'General' | 'FactCheck' | 'Government';
}

export const LIVE_NEWS_RSS_FEEDS: RSSSourceConfig[] = [
  // ── Neutral Wires & Global Standards ──
  {
    id: 'rss-reuters',
    name: 'Reuters World News',
    domain: 'reuters.com',
    biasCategory: 'Center',
    rssUrl: 'https://news.google.com/rss/search?q=site:reuters.com+when:24h&hl=en-US&gl=US&ceid=US:en',
    category: 'General'
  },
  {
    id: 'rss-bbc',
    name: 'BBC News US & Canada',
    domain: 'bbc.com',
    biasCategory: 'Center',
    rssUrl: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml',
    category: 'Politics'
  },
  {
    id: 'rss-pbs',
    name: 'PBS NewsHour Politics',
    domain: 'pbs.org',
    biasCategory: 'Center',
    rssUrl: 'https://www.pbs.org/newshour/feeds/rss/politics',
    category: 'Politics'
  },
  {
    id: 'rss-ap',
    name: 'Associated Press News',
    domain: 'apnews.com',
    biasCategory: 'Lean_Left',
    rssUrl: 'https://news.google.com/rss/search?q=site:apnews.com+when:24h&hl=en-US&gl=US&ceid=US:en',
    category: 'Politics'
  },

  // ── Center-Left & Left Outlets ──
  {
    id: 'rss-npr',
    name: 'NPR Politics',
    domain: 'npr.org',
    biasCategory: 'Lean_Left',
    rssUrl: 'https://feeds.npr.org/1014/rss.xml',
    category: 'Politics'
  },
  {
    id: 'rss-nyt',
    name: 'The New York Times Politics',
    domain: 'nytimes.com',
    biasCategory: 'Lean_Left',
    rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    category: 'Politics'
  },
  {
    id: 'rss-cnn',
    name: 'CNN Politics',
    domain: 'cnn.com',
    biasCategory: 'Left',
    rssUrl: 'http://rss.cnn.com/rss/cnn_allpolitics.rss',
    category: 'Politics'
  },
  {
    id: 'rss-msnbc',
    name: 'MSNBC News',
    domain: 'msnbc.com',
    biasCategory: 'Left',
    rssUrl: 'https://news.google.com/rss/search?q=site:msnbc.com+when:24h&hl=en-US&gl=US&ceid=US:en',
    category: 'Politics'
  },
  {
    id: 'rss-vox',
    name: 'Vox Policy & Politics',
    domain: 'vox.com',
    biasCategory: 'Left',
    rssUrl: 'https://www.vox.com/rss/index.xml',
    category: 'Politics'
  },

  // ── Center-Right & Right Outlets ──
  {
    id: 'rss-wsj',
    name: 'The Wall Street Journal World News',
    domain: 'wsj.com',
    biasCategory: 'Center',
    rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    category: 'General'
  },
  {
    id: 'rss-fox',
    name: 'Fox News Politics',
    domain: 'foxnews.com',
    biasCategory: 'Right',
    rssUrl: 'https://moxie.foxnews.com/google-publisher/politics.xml',
    category: 'Politics'
  },
  {
    id: 'rss-dailywire',
    name: 'The Daily Wire News',
    domain: 'dailywire.com',
    biasCategory: 'Right',
    rssUrl: 'https://www.dailywire.com/feeds/rss.xml',
    category: 'Politics'
  },
  {
    id: 'rss-newsmax',
    name: 'Newsmax Politics',
    domain: 'newsmax.com',
    biasCategory: 'Right',
    rssUrl: 'https://news.google.com/rss/search?q=site:newsmax.com+when:24h&hl=en-US&gl=US&ceid=US:en',
    category: 'Politics'
  },

  // ── Primary Government & Fact-Check Repositories ──
  {
    id: 'rss-politifact',
    name: 'PolitiFact Latest Fact-Checks',
    domain: 'politifact.com',
    biasCategory: 'Center',
    rssUrl: 'https://www.politifact.com/rss/factchecks/',
    category: 'FactCheck'
  }
];
