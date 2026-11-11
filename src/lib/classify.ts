import type { CategorySlug } from "./categories";

export type AudienceTarget =
  | "ho-kinh-doanh"
  | "nguoi-di-lam"
  | "gia-dinh"
  | "du-hoc-hoc-nghe"
  | "cu-tru-quoc-tich";

export type LawStatus = "de-xuat" | "noi-cac" | "quoc-hoi" | "co-hieu-luc";

export const AUDIENCE_GROUPS: { slug: AudienceTarget; label: string; short: string; desc: string }[] = [
  {
    slug: "cu-tru-quoc-tich",
    label: "Cư trú & Quốc tịch",
    short: "Cư trú · Quốc tịch",
    desc: "Song tịch, gia hạn thẻ cư trú, Sở Ngoại kiều, đoàn tụ gia đình",
  },
  {
    slug: "ho-kinh-doanh",
    label: "Chủ tiệm & Hộ kinh doanh",
    short: "Chủ tiệm · Kinh doanh",
    desc: "Nhà hàng, tiệm nail, tạp hóa, thuế, máy tính tiền TSE, hải quan FKS",
  },
  {
    slug: "nguoi-di-lam",
    label: "Người đi làm & Thuế",
    short: "Đi làm · Lương · Thuế",
    desc: "Lương tối thiểu, Minijob, bảo hiểm y tế, lương hưu, trợ cấp Bürgergeld",
  },
  {
    slug: "gia-dinh",
    label: "Gia đình & Đời sống",
    short: "Gia đình · Con cái",
    desc: "Kindergeld, Elterngeld, nhà trẻ Kita, trường học, thuê nhà, tàu xe",
  },
  {
    slug: "du-hoc-hoc-nghe",
    label: "Du học & Học nghề (Azubi)",
    short: "Du học · Azubi · Điều dưỡng",
    desc: "Chancenkarte, visa học nghề, điều dưỡng, tài khoản phong tỏa, làm thêm",
  },
];

export const LAW_STATUS_LABELS: Record<LawStatus, { label: string; badgeClass: string; desc: string }> = {
  "de-xuat": {
    label: "Đang đề xuất · Tranh luận",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    desc: "Mới là đề xuất chính trị hoặc dự thảo của Bộ, chưa áp dụng trong thực tế.",
  },
  "noi-cac": {
    label: "Nội các đã thông qua dự thảo",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-300",
    desc: "Chính phủ đã duyệt dự thảo, còn phải chờ Quốc hội (Bundestag) biểu quyết.",
  },
  "quoc-hoi": {
    label: "Quốc hội đã thông qua",
    badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300",
    desc: "Đã qua Bundestag/Bundesrat, chuẩn bị bước vào ngày có hiệu lực chính thức.",
  },
  "co-hieu-luc": {
    label: "Đã chính thức có hiệu lực",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    desc: "Quy định đang được áp dụng trực tiếp trên toàn liên bang hoặc tại bang.",
  },
};

type Rule = { cat: CategorySlug; weight: number; words: RegExp };

const RULES: Rule[] = [
  {
    cat: "nguoi-viet",
    weight: 16,
    words:
      /vietnam|vietnames|hanoi|saigon|ho-chi-minh|dong xuan|lichtenberg|vertragsarbeiter|boatpeople|boat people|nagelstudio|asia-imbiss|pho\b/i,
  },
  {
    cat: "di-tru",
    weight: 7,
    words:
      /migration|migrant|einbürger|staatsangehörig|staatsbürger|aufenthalt|visum|visa\b|asyl|abschieb|flüchtling|geflüchtet|ausländer|zuwander|einwander|fachkräfte|chancenkarte|familiennachzug|integration|grenzkontroll|zurückweis|bamf|blaue karte|duldung|niederlassungs/i,
  },
  {
    cat: "luat-moi",
    weight: 5,
    words:
      /gesetz|verordnung|tritt in kraft|in kraft|neue regel|regelung|verbot|urteil|verfassungsgericht|bundesgerichtshof|\bbgh\b|beschlossen|beschließt|bundesrat|novelle|ab januar|ab 1\.|kabinett|gesetzentwurf|reform/i,
  },
  {
    cat: "kinh-te",
    weight: 4,
    words:
      /wirtschaft|inflation|preise|mindestlohn|steuer|rente|arbeitsmarkt|arbeitslos|insolvenz|industrie|konjunktur|\bdax\b|energie|strompreis|gaspreis|lohn|tarif|streik|bürgergeld|grundsicherung|kindergeld|minijob|haushalt|schulden|unternehmen|gastronomie|einzelhandel|e-rechnung|kasse|finanzamt|zoll|schwarzarbeit/i,
  },
  {
    cat: "chinh-tri",
    weight: 3,
    words:
      /bundestag|kanzler|merz|koalition|\bcdu\b|\bcsu\b|\bspd\b|\bafd\b|grüne|linke|\bfdp\b|\bbsw\b|minister|regierung|wahl|partei|bundespräsident|landtag|opposition|dobrindt|klingbeil|söder|pistorius/i,
  },
  {
    cat: "doi-song",
    weight: 3,
    words:
      /deutsche bahn|\bbahn\b|deutschlandticket|verkehr|krankenkasse|krankenversicherung|gesundheit|pflege|schule|kita|wohnung|miete|mieter|polizei|kriminal|feiertag|wetter|unwetter|krankenhaus|apotheke|führerschein|rundfunkbeitrag|eltern/i,
  },
];

// Policy keywords that matter strongly to Vietnamese residents (business owners, workers, families, students).
const VN_IMPACT =
  /bürgergeld|grundsicherung|mindestlohn|minijob|kindergeld|elterngeld|wohngeld|miete|krankenkasse|zusatzbeitrag|rente|steuer|kasse|tse\b|e-rechnung|gastronomie|nagelstudio|einzelhandel|schwarzarbeit|ausbildung|azubi|studierende|student|pflegekräfte|pflegekraft|deutschlandticket|führerschein|einbürger|aufenthalt|ausländerbehörde|familiennachzug|abschieb|vietnam|dong xuan/i;

const NOISE =
  /bundesliga|fußball|champions league|tennis|formel 1|\bnba\b|\bnfl\b|tatort|promi|royals|horoskop|\bdfb\b|olympia|handball|biathlon|lotto|dschungelcamp|bachelor/i;
const FOREIGN =
  /\busa\b|trump|china|russland|ukraine|gaza|israel|iran|frankreich|großbritannien|brasilien|indien|afrika|syrien|venezuela/i;
const DOMESTIC =
  /deutschland|bund|berlin|bayern|sachsen|nrw|hamburg|hessen|thüringen|brandenburg|niedersachsen|baden|bremen|kiel|leipzig|dresden|münchen|köln|frankfurt|stuttgart|chemnitz|erfurt|rostock|hannover/i;

export function detectAudiences(text: string): AudienceTarget[] {
  const out = new Set<AudienceTarget>();
  if (/einbürger|staatsangehörig|aufenthalt|visum|visa|ausländerbehörde|familiennachzug|duldung|pass\b|niederlassung/i.test(text)) {
    out.add("cu-tru-quoc-tich");
  }
  if (/gastronomie|nagelstudio|einzelhandel|kasse|e-rechnung|finanzamt|schwarzarbeit|zoll|selbstständig|unternehmen|insolvenz|gewerbe|mindestlohn/i.test(text)) {
    out.add("ho-kinh-doanh");
  }
  if (/mindestlohn|minijob|lohn|gehalt|steuer|rente|krankenkasse|bürgergeld|grundsicherung|jobcenter|arbeitsmarkt|tarif|streik/i.test(text)) {
    out.add("nguoi-di-lam");
  }
  if (/kindergeld|elterngeld|kita|schule|wohnung|miete|mieter|deutschlandticket|bahn|krankenhaus|pflege|familie/i.test(text)) {
    out.add("gia-dinh");
  }
  if (/ausbildung|azubi|studierende|student|chancenkarte|fachkräfte|pflegekräfte|hochschule|universität|sperrkonto/i.test(text)) {
    out.add("du-hoc-hoc-nghe");
  }
  return [...out];
}

export function detectLawStatus(text: string): LawStatus | null {
  if (/tritt in kraft|in kraft getreten|gilt ab|ab sofort|seit 1\.|ist in kraft/i.test(text)) return "co-hieu-luc";
  if (/bundestag.*beschlossen|bundesrat.*gebilligt|gesetz.*verabschiedet|parlament.*stimmt zu/i.test(text)) return "quoc-hoi";
  if (/kabinett.*beschlossen|kabinett.*billigt|gesetzentwurf.*kabinett|bundesregierung.*bringt.*ein/i.test(text)) return "noi-cac";
  if (/fordert|plant|vorschlag|debatte|will.*verschärfen|reformpläne|diskutiert|entwurf/i.test(text)) return "de-xuat";
  return null;
}

export function classify(
  title: string,
  summary: string,
  domesticSource: boolean,
): { category: CategorySlug; relevance: number; audiences: AudienceTarget[]; lawStatus: LawStatus | null } {
  const text = `${title} ${summary}`;
  const scores = new Map<CategorySlug, number>();
  let relevance = 0;
  for (const r of RULES) {
    const matches = text.match(new RegExp(r.words.source, "gi"));
    if (matches?.length) {
      const s = r.weight * Math.min(matches.length, 3);
      scores.set(r.cat, (scores.get(r.cat) ?? 0) + s);
      relevance += s;
    }
  }
  if (VN_IMPACT.test(text)) relevance += 8;
  if (DOMESTIC.test(text)) relevance += 3;
  if (domesticSource) relevance += 2;
  if (FOREIGN.test(title) && !DOMESTIC.test(text) && !/vietnam/i.test(text)) relevance -= 6;
  if (NOISE.test(text)) relevance -= 25;

  let category: CategorySlug = "thoi-su";
  let best = 0;
  for (const [cat, s] of scores) {
    if (s > best) {
      best = s;
      category = cat;
    }
  }
  // Vietnamese-related content always lands in the community section with top priority
  if ((scores.get("nguoi-viet") ?? 0) > 0 && /vietnam|vietnames|dong xuan/i.test(text)) {
    category = "nguoi-viet";
    relevance += 15;
  }

  return {
    category,
    relevance,
    audiences: detectAudiences(text),
    lawStatus: detectLawStatus(text),
  };
}

/** Token set used for cross-outlet de-duplication & multi-source clustering of the same story. */
export function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-zäöüß0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !/^(nach|über|unter|gegen|wegen|beim|oder|aber|auch|noch|mehr|neue|neuer|neues|deutschland|deutsche|deutschen)$/.test(w)),
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / Math.min(a.size, b.size);
}
