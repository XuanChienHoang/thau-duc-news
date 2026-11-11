export type Source = {
  id: string;
  name: string;
  url: string;
  homepage: string;
  /** Germany-focused feeds get a relevance bonus. */
  domestic: boolean;
  tier?: "national" | "official" | "regional" | "radar";
};

/**
 * 24 nguồn tin chuẩn mực và chính thống tại Đức:
 * 1) Báo chí & truyền hình công lập quốc gia (Leitmedien)
 * 2) Cơ quan lập pháp & Chính phủ Liên bang
 * 3) Đài truyền hình công lập các bang đông người Việt sinh sống
 * 4) Radar truy vấn tin báo chí Đức chuyên biệt về cộng đồng người Việt, di trú và chính sách thuế/lao động
 *
 * Nguyên tắc bản quyền: Chỉ lấy metadata RSS và trích xuất dữ kiện (ai, cái gì, con số, ngày hiệu lực),
 * tuyệt đối không lấy ảnh gốc của tòa soạn báo Đức.
 */
export const SOURCES: Source[] = [
  // 1. Báo chí & Truyền hình Quốc gia (National Leitmedien)
  {
    id: "tagesschau-inland",
    name: "tagesschau",
    url: "https://www.tagesschau.de/inland/index~rss2.xml",
    homepage: "https://www.tagesschau.de",
    domestic: true,
    tier: "national",
  },
  {
    id: "tagesschau-wirtschaft",
    name: "tagesschau Wirtschaft",
    url: "https://www.tagesschau.de/wirtschaft/index~rss2.xml",
    homepage: "https://www.tagesschau.de/wirtschaft",
    domestic: true,
    tier: "national",
  },
  {
    id: "tagesschau",
    name: "tagesschau",
    url: "https://www.tagesschau.de/index~rss2.xml",
    homepage: "https://www.tagesschau.de",
    domestic: false,
    tier: "national",
  },
  {
    id: "zdfheute",
    name: "ZDFheute",
    url: "https://www.zdfheute.de/rss/zdf/nachrichten",
    homepage: "https://www.zdfheute.de",
    domestic: true,
    tier: "national",
  },
  {
    id: "dlf",
    name: "Deutschlandfunk",
    url: "https://www.deutschlandfunk.de/nachrichten-100.rss",
    homepage: "https://www.deutschlandfunk.de",
    domestic: true,
    tier: "national",
  },
  {
    id: "spiegel",
    name: "DER SPIEGEL",
    url: "https://www.spiegel.de/schlagzeilen/index.rss",
    homepage: "https://www.spiegel.de",
    domestic: false,
    tier: "national",
  },
  {
    id: "spiegel-politik",
    name: "DER SPIEGEL Politik",
    url: "https://www.spiegel.de/politik/deutschland/index.rss",
    homepage: "https://www.spiegel.de/politik/deutschland",
    domestic: true,
    tier: "national",
  },
  {
    id: "zeit",
    name: "ZEIT ONLINE",
    url: "https://newsfeed.zeit.de/index",
    homepage: "https://www.zeit.de",
    domestic: false,
    tier: "national",
  },
  {
    id: "zeit-politik",
    name: "ZEIT Politik",
    url: "https://newsfeed.zeit.de/politik/index",
    homepage: "https://www.zeit.de/politik",
    domestic: true,
    tier: "national",
  },
  {
    id: "sz",
    name: "Süddeutsche Zeitung",
    url: "https://rss.sueddeutsche.de/rss/Topthemen",
    homepage: "https://www.sueddeutsche.de",
    domestic: false,
    tier: "national",
  },
  {
    id: "faz",
    name: "Frankfurter Allgemeine (FAZ)",
    url: "https://www.faz.net/rss/aktuell/",
    homepage: "https://www.faz.net",
    domestic: false,
    tier: "national",
  },
  {
    id: "faz-wirtschaft",
    name: "FAZ Wirtschaft",
    url: "https://www.faz.net/rss/aktuell/wirtschaft/",
    homepage: "https://www.faz.net/aktuell/wirtschaft",
    domestic: true,
    tier: "national",
  },
  {
    id: "handelsblatt",
    name: "Handelsblatt",
    url: "https://www.handelsblatt.com/contentexport/feed/schlagzeilen",
    homepage: "https://www.handelsblatt.com",
    domestic: true,
    tier: "national",
  },
  {
    id: "dw",
    name: "Deutsche Welle",
    url: "https://rss.dw.com/rdf/rss-de-all",
    homepage: "https://www.dw.com/de",
    domestic: false,
    tier: "national",
  },
  {
    id: "ntv",
    name: "n-tv",
    url: "https://www.n-tv.de/rss",
    homepage: "https://www.n-tv.de",
    domestic: false,
    tier: "national",
  },

  // 2. Cơ quan Chính phủ & Quốc hội Liên bang (Official Sources)
  {
    id: "bundesregierung",
    name: "Bundesregierung",
    url: "https://www.bundesregierung.de/service/rss/breg-de/1151244/feed.xml",
    homepage: "https://www.bundesregierung.de",
    domestic: true,
    tier: "official",
  },

  // 3. Đài truyền hình các Bang đông cộng đồng người Việt (Regional Public Broadcasters)
  {
    id: "rbb24",
    name: "rbb24 (Berlin & Brandenburg)",
    url: "https://www.rbb24.de/aktuell/index.xml/feed=rss.xml",
    homepage: "https://www.rbb24.de",
    domestic: true,
    tier: "regional",
  },
  {
    id: "mdr",
    name: "MDR Aktuell (Sachsen · Thüringen · Sachsen-Anhalt)",
    url: "https://www.mdr.de/nachrichten/index~rss2.xml",
    homepage: "https://www.mdr.de",
    domestic: true,
    tier: "regional",
  },
  {
    id: "ndr",
    name: "NDR (Hamburg & Bắc Đức)",
    url: "https://www.ndr.de/nachrichten/info/index-rss.xml",
    homepage: "https://www.ndr.de",
    domestic: true,
    tier: "regional",
  },
  {
    id: "br24",
    name: "BR24 (Bayern)",
    url: "https://nachrichtenfeeds.br.de/rdf/boards/QXAPkQJ",
    homepage: "https://www.br.de/nachrichten",
    domestic: true,
    tier: "regional",
  },
  {
    id: "wdr",
    name: "WDR (Nordrhein-Westfalen)",
    url: "https://www1.wdr.de/uebersicht-100.feed",
    homepage: "https://www1.wdr.de",
    domestic: true,
    tier: "regional",
  },

  // 4. Radar Chuyên biệt Cộng đồng Người Việt & Chính sách Sát sườn (Targeted German Press Queries)
  {
    id: "radar-vietnam-de",
    name: "Radar Báo Đức · Cộng đồng Việt",
    url: "https://news.google.com/rss/search?q=(Vietnamesen+OR+vietnamesisch+OR+%22Dong+Xuan%22+OR+%22Vietnam%22+Deutschland)+when:7d&hl=de&gl=DE&ceid=DE:de",
    homepage: "https://news.google.com/?hl=de&gl=DE&ceid=DE:de",
    domestic: true,
    tier: "radar",
  },
  {
    id: "radar-migration-law",
    name: "Radar Báo Đức · Di trú & Quốc tịch",
    url: "https://news.google.com/rss/search?q=(Einb%C3%BCrgerung+OR+Aufenthaltstitel+OR+Chancenkarte+OR+Ausl%C3%A4nderbeh%C3%B6rde+OR+Fachkr%C3%A4fteeinwanderung+OR+Staatsangeh%C3%B6rigkeit)+when:4d&hl=de&gl=DE&ceid=DE:de",
    homepage: "https://www.bamf.de",
    domestic: true,
    tier: "radar",
  },
  {
    id: "radar-policy-economy",
    name: "Radar Báo Đức · Thuế, Lương & Trợ cấp",
    url: "https://news.google.com/rss/search?q=(Mindestlohn+OR+B%C3%BCrgergeld+OR+Grundsicherung+OR+Kindergeld+OR+Krankenkasse+OR+Gastronomie+Steuer+OR+Minijob)+when:4d&hl=de&gl=DE&ceid=DE:de",
    homepage: "https://www.bmas.de",
    domestic: true,
    tier: "radar",
  },
];

export function getSource(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
