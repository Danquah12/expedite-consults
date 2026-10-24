export type NewsRegion = "United States" | "United Kingdom & Europe" | "World";

export type NewsStation = {
  id: string;
  name: string;
  region: NewsRegion;
  /** YouTube channel for a live broadcast. Omitted when the desk is a site. */
  channelId?: string;
  /** Used when the main channel has no embeddable live video. */
  fallbackChannelId?: string;
  /** Last confirmed live video. Replaced when the desk finds a newer broadcast. */
  liveId?: string;
  /** A full desk that is not a YouTube live channel. */
  site?: string;
};

/** The live Desk Note. News & Analysis embeds this address and no older copy. */
export const DESK_NOTE_URL = "https://desk-note-lime.vercel.app/";

/** Official YouTube channels. The player uses each channel's current live stream, not a saved clip. */
export const NEWS_STATIONS: NewsStation[] = [
  { id: "cnn", name: "CNN", region: "United States", channelId: "UCupvZG-5ko_eiXAupbDfxWw", liveId: "GotlA1KKWoo" },
  { id: "fox", name: "Fox News", region: "United States", channelId: "UCXIJgqnII2ZOINSWNOGFThA", fallbackChannelId: "UCJg9wBPyKMNA5sRDnvzmkdg", liveId: "C96oohpWBGw" },
  { id: "abc", name: "ABC News", region: "United States", channelId: "UCBi2mrWuNuyYy4gbM6fU18Q", liveId: "ODio2-1aFa8" },
  { id: "nbc", name: "NBC News", region: "United States", channelId: "UCeY0bbntWzzVIaj2z3QigXg", liveId: "BKOZyONHtUs" },
  { id: "cbs", name: "CBS News", region: "United States", channelId: "UC8p1vwvWtl6T73JiExfWs1g", liveId: "Px5qqWf1Kxk" },
  { id: "cnbc", name: "CNBC", region: "United States", channelId: "UCvJJ_dzjViJCoLf5uKUTwoA", liveId: "9NyxcX3rhQs" },
  { id: "msnow", name: "MS NOW", region: "United States", channelId: "UCaXkIU1QidjPwiAYu6GcHjg", liveId: "MLnTqKksftM" },
  { id: "pbs", name: "PBS NewsHour", region: "United States", channelId: "UC6ZFN9Tx6xh-skXCuRHCDpQ", liveId: "ZwNFvNYOvCI" },
  { id: "bloomberg", name: "Bloomberg", region: "United States", channelId: "UCIALMKvObZNtJ6AmdCLP7Lg", liveId: "QB5BNdBFujE" },
  { id: "ap", name: "Associated Press", region: "United States", channelId: "UC52X5wxOL_s5yw0dQk7NtgA", liveId: "QR8Y1xh2sKE" },
  { id: "newsnation", name: "NewsNation", region: "United States", channelId: "UCCjG8NtOig0USdrT5D1FpxQ" },
  { id: "bbc", name: "BBC News", region: "United Kingdom & Europe", channelId: "UC16niRr50-MSBwiO3YDb3RA", liveId: "sc21UUjyLaw" },
  { id: "sky", name: "Sky News", region: "United Kingdom & Europe", channelId: "UCoMdktPbSTixAyNGwb-UYkQ", liveId: "xDWQ3LkccY8" },
  { id: "gb", name: "GB News", region: "United Kingdom & Europe", channelId: "UC0vn8ISa4LKMunLbzaXLnOQ", liveId: "gmRJ5hpMVhw" },
  { id: "dw", name: "DW News", region: "United Kingdom & Europe", channelId: "UCknLrEdhRCp1aegoMqRaCZg", liveId: "LuKwFajn37U" },
  { id: "euro", name: "euronews", region: "United Kingdom & Europe", channelId: "UCSrZ3UV4jOidv8ppoVuvW9Q", liveId: "pykpO5kQJ98" },
  { id: "f24", name: "France 24", region: "United Kingdom & Europe", channelId: "UCQfwfsi5VrQ8yKZ-UWmAEFg", liveId: "HvZt-nh9sGg" },
  { id: "aj", name: "Al Jazeera", region: "World", channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", liveId: "gCNeDWCI0vo" },
  { id: "reuters", name: "Reuters", region: "World", channelId: "UChqUTb7kYRX8-EiaN3XFrSQ", liveId: "srVTULLSv08" },
  { id: "nhk", name: "NHK World", region: "World", channelId: "UCSPEjw8F2nQDtmUKPFNF7_A", liveId: "IimtbuqYIE8" },
  { id: "abcau", name: "ABC Australia", region: "World", channelId: "UCVgO39Bk5sMo66-6o6Spn6Q", liveId: "vOTiJkg1voo" },
  { id: "cna", name: "CNA", region: "World", channelId: "UC83jt4dlz1Gjl58fzQrrKZg", liveId: "XWq5kBlakcQ" },
  { id: "cbc", name: "CBC News", region: "World", channelId: "UCuFFtHWoLl5fauMMD5Ww2jA", liveId: "5vfaDsMhCF4" },
  { id: "global", name: "Global News", region: "World", channelId: "UChLtXXpo4Ge1ReTEboVvTDg" },
  { id: "i24", name: "i24NEWS", region: "World", channelId: "UCvHDpsWKADrDia0c99X37vg", liveId: "I5ja5_qnKNQ" },
  { id: "trt", name: "TRT World", region: "World", channelId: "UC7fWeaHhqgM4Ry-RMpM2YYw", liveId: "qBe59l6p_EU" },
  { id: "wion", name: "WION", region: "World", channelId: "UC_gUM8rL-Lrg6O3adPW9K1g", liveId: "cDR3kDB6q7A" },
  { id: "indiatoday", name: "India Today", region: "World", channelId: "UCYPvAwZP8pZhSMW8qs7cVCw", liveId: "8hjFNnlsVFg" },
  { id: "ndtv", name: "NDTV", region: "World", channelId: "UCZFMm1mMw0F81Z37aaEzTUA", liveId: "wzyrntWQsxg" },
  { id: "arise", name: "Arise News", region: "World", channelId: "UCyEJX-kSj0kOOCS7Qlq2G7g", liveId: "Fy_03Aorpq8" },
  { id: "veritas", name: "Veritas Lens", region: "World", site: "https://expedite-consults.vercel.app/veritaslens" },
  { id: "desk-note", name: "Desk Note", region: "World", site: DESK_NOTE_URL },
];

export const NEWS_REGIONS: NewsRegion[] = ["United States", "United Kingdom & Europe", "World"];

export function jumpToNewsVideo() {
  /* Choosing a desk plays the clip in place. The page does not scroll to the player. */
}
