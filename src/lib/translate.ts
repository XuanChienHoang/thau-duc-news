/**
 * Fallback when no AI key is configured: machine-translate ONLY the headline and the short teaser
 * (never the full article), then polish common German terms into natural Vietnamese.
 */
const GLOSSARY: [RegExp, string][] = [
  [/tiền (của )?công dân|trợ cấp công dân|thu nhập công dân/gi, "trợ cấp Bürgergeld"],
  [/Thủ tướng Liên bang/gi, "Thủ tướng"],
  [/Hạ viện Liên bang|Quốc hội Liên bang|Bundestag Đức/gi, "Quốc hội Đức (Bundestag)"],
  [/Hội đồng Liên bang/gi, "Thượng viện (Bundesrat)"],
  [/Chính phủ liên bang/gi, "Chính phủ Đức"],
  [/Văn phòng Liên bang về Di cư và Người tị nạn/gi, "Cơ quan Di trú Liên bang (BAMF)"],
  [/Văn phòng người nước ngoài|văn phòng người ngoài hành tinh/gi, "Sở Ngoại kiều"],
  [/vé nước Đức|vé Đức(?! )/gi, "vé Deutschlandticket"],
  [/Liên minh Dân chủ Cơ đốc giáo|Liên minh Dân chủ Thiên chúa giáo/gi, "đảng CDU"],
  [/Đảng Dân chủ Xã hội/gi, "đảng SPD"],
  [/Giải pháp thay thế cho nước Đức|Sự lựa chọn cho nước Đức/gi, "đảng AfD"],
  [/Đường sắt Đức/gi, "Deutsche Bahn"],
  [/liên minh đèn giao thông/gi, "liên minh “đèn giao thông”"],
  [/Tòa án Hiến pháp Liên bang/gi, "Tòa án Hiến pháp Đức"],
  [/công ty bảo hiểm y tế/gi, "quỹ bảo hiểm y tế"],
];

function polish(s: string): string {
  let out = s;
  for (const [re, rep] of GLOSSARY) out = out.replace(re, rep);
  out = out.replace(/\s+([,.!?:;])/g, "$1").replace(/\s{2,}/g, " ").trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export async function translateDeVi(text: string): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=vi&dt=t&q=${encodeURIComponent(text.slice(0, 1800))}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!res.ok) throw new Error(`Dịch máy lỗi ${res.status}`);
  const data = (await res.json()) as [[string, string][]];
  const translated = (data?.[0] ?? []).map((seg) => seg?.[0] ?? "").join("");
  if (!translated) throw new Error("Dịch máy trả về rỗng");
  return polish(translated);
}
