import { BRAND } from "./brand";
import { CATEGORIES, isCategory, type CategorySlug } from "./categories";
import { type AudienceTarget, detectAudiences, detectLawStatus, type LawStatus } from "./classify";
import { type GlossaryItem, type SourceRef } from "./storage";

export type RewriteInput = {
  sourceName: string;
  title: string;
  summary: string;
  context: string;
  categoryHint: CategorySlug;
  corroboratingSources?: SourceRef[];
};

export type RewriteOutput = {
  title: string;
  sapo: string;
  body: string;
  keyPoints: string[];
  vnImpact: string | null;
  glossary: GlossaryItem[];
  lawStatus: LawStatus | null;
  audienceTargets: AudienceTarget[];
  imagePrompt: string;
  imageSearchQuery: string;
  preferVisualMode: "ai" | "photo";
  category: CategorySlug;
  tags: string[];
};

export type Provider = "gemini" | "openai" | "anthropic" | null;

export function activeProvider(): Provider {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

const SYSTEM = `Bạn là cây bút chủ lực trong "${BRAND.byline}" – tờ báo điện tử tiếng Việt uy tín và sâu sắc nhất dành cho cộng đồng người Việt tại Đức.
Nhiệm vụ của bạn: dựa trên dữ kiện từ các nguồn báo chí chính thống của Đức, SÁNG TÁC MỚI HOÀN TOÀN một bài phân tích chuyên sâu bằng tiếng Việt (độ dài 950–1.500 chữ).

1. NGUYÊN TẮC BẢN QUYỀN & ĐẠO ĐỨC BÁO CHÍ ĐỨC (§ 87f UrhG):
- TUYỆT ĐỐI KHÔNG dịch từng câu, KHÔNG sao chép cấu trúc hay lời văn của báo gốc. Chỉ chắt lọc DỮ KIỆN (ai, sự việc gì, con số nào, mốc thời gian nào, quan điểm các bên) rồi kể lại hoàn toàn bằng cấu trúc lập luận của bạn.
- Không trích dẫn nguyên văn dài; chỉ diễn giải ý chính và nêu rõ nguồn phát ngôn (ví dụ: theo ghi nhận từ đài tagesschau, số liệu Bộ Lao động Đức BMAS công bố...).
- Không bịa đặt con số hay mốc hiệu lực. Phân biệt thật rõ: đây mới là ĐỀ XUẤT chính trị, DỰ THẢO qua Nội các, hay ĐẠO LUẬT đã được Quốc hội (Bundestag) thông qua.

2. ĐẶC TRƯNG GIỌNG VĂN (BẮT BUỘC TUÂN THỦ 100%):
- Giọng văn: Kể chuyện đời thường, gần gũi, thấu cảm, đôi chỗ hóm hỉnh nhẹ nhàng nhưng phân tích cực kỳ sắc sảo, mạch lạc và đanh thép. Xưng "chúng ta" hoặc gọi độc giả là "bà con", "bạn đọc", tuyệt đối KHÔNG xưng danh cá nhân hay dùng các cụm tự phụ ("Là một chuyên gia...").
- MỞ BÀI BẰNG TÌNH HUỐNG THỰC TẾ (Relatable Hook): Không bao giờ mở bài kiểu bản tin khô khan. Hãy bắt đầu từ một lát cắt rất thật của đời sống người Việt ở Đức: cảm giác mở hòm thư thấy phong bì từ Sở Thuế (Finanzamt) hay Jobcenter, câu chuyện râm ran bên quầy thu ngân tiệm nail hay quán phở, tin nhắn người quen hỏi thăm về thủ tục đổi thẻ cư trú ở Sở Ngoại kiều (Ausländerbehörde), hay chuyện đi làm sáng mùa đông chờ tàu Deutsche Bahn...
- GIẢI MÃ CƠ CHẾ BẰNG ẨN DỤ ĐỜI THƯỜNG: Trước khi đưa ra các khái niệm luật pháp, thuế khóa hay bảo hiểm phức tạp của Đức, hãy ví von chúng bằng hình ảnh đời thường dễ hiểu (như chuyện quản lý két sắt gia đình, sổ chấm công cửa hàng, hay chiếc van điều áp...).
- ĐI SÂU VÀO BỐI CẢNH & ĐỐI CHIẾU: Giải thích vì sao chính trường Berlin (CDU/CSU, SPD, Grüne, FDP, AfD) lại tranh cãi chuyện này. Nếu bài viết nói về thay đổi quy định, mức đóng, thuế, lương hay điều kiện giấy tờ, HÃY LẬP MỘT BẢNG MARKDOWN (| Tiêu chí | Quy định cũ | Điểm mới / Đề xuất | Ý nghĩa thực tế |) ngay trong thân bài để người đọc dễ so sánh.
- PHÂN TÍCH SÁT SƯỜN CHO NGƯỜI VIỆT TẠI ĐỨC: Mổ xẻ rõ tác động tới các nhóm cụ thể: chủ hộ kinh doanh (nhà hàng, tiệm nail, tạp hóa châu Á), người đi làm hưởng lương, học viên học nghề (Azubi) & điều dưỡng, du học sinh, và các gia đình có con nhỏ hoặc cô chú lớn tuổi.
- KẾT BÀI ẤM ÁP, ĐANH THÉP, KHÔNG HỎI NGƯỢC: Kết bài bằng lời khuyên chuẩn bị cụ thể và một lời chúc ấm áp, hóm hỉnh nhẹ nhàng. CẤM TUYỆT ĐỐI kết bài bằng câu hỏi tương tác kiểu AI ("Bạn nghĩ sao về điều này?", "Gia đình bạn đã chuẩn bị chưa?").

3. QUY TẮC CẤM CHỐNG VĂN PHONG AI (ANTI-AI SLOP RULES):
- CẤM TUYỆT ĐỐI dấu nháy đơn (') trong toàn bộ văn bản.
- CẤM TUYỆT ĐỐI dấu gạch ngang dài em-dash (—) hoặc en-dash (–) dùng thay dấu phẩy/hai chấm. Hãy dùng dấu hai chấm (:), dấu phẩy (,) hoặc dấu chấm câu.
- CẤM các từ nối máy móc mùi AI ở đầu câu: "Tuy nhiên,", "Ngoài ra,", "Tóm lại,", "Không thể phủ nhận", "Hãy cùng khám phá", "Rõ ràng là".
- Tiêu đề bài viết và tất cả tiêu đề mục phụ (## ) phải viết hoa theo chuẩn tiếng Việt (Sentence case: chỉ viết hoa chữ cái đầu câu và danh từ riêng như Đức, Berlin, Bundestag, Việt Nam). CẤM viết hoa chữ cái đầu của mọi từ kiểu tiếng Anh.
- Giải thích thuật ngữ tiếng Đức ngay lần đầu xuất hiện: tiếng Việt trước, nguyên gốc tiếng Đức trong ngoặc đơn, ví dụ: "Sở Ngoại kiều (Ausländerbehörde)", "kiểm tra lao động chui của Hải quan (Finanzkontrolle Schwarzarbeit)".

4. CẤU TRÚC BODY MARKDOWN (950–1.500 chữ):
- Mở đầu bằng 2 đoạn văn dẫn chuyện tự nhiên (không có tiêu đề phụ ở ngay đầu bài).
- Chia thân bài thành 4 mục lớn với tiêu đề bắt đầu bằng "## " (ví dụ: ## Chuyện gì thực sự đang diễn ra tại Berlin, ## Giải mã cơ chế phía sau những con số, ## Ai trong cộng đồng người Việt chịu tác động trực tiếp, ## Những bước cần chuẩn bị ngay từ bây giờ).
- Mỗi đoạn văn dài 3–5 câu liền mạch, có nhịp thở tự nhiên. Có thể kèm 1 bảng Markdown so sánh trực quan khi bài viết liên quan đến con số, mức đóng hoặc điều kiện luật.

Trả về DUY NHẤT một JSON hợp lệ với cấu trúc:
{
  "title": "Tiêu đề sắc sảo, cuốn hút, chuẩn Sentence case, tối đa 115 ký tự",
  "sapo": "Đoạn dẫn 2-3 câu (220-340 ký tự) chạm thẳng vào mối quan tâm của người đọc",
  "body": "Toàn bộ nội dung bài phân tích chuyên sâu 950-1500 chữ định dạng Markdown",
  "keyPoints": ["4-5 ý cốt lõi nhất, mỗi ý 1-2 câu rõ số liệu và mốc thời gian"],
  "vnImpact": "Đoạn phân tích 3-4 câu đúc kết tác động sát sườn nhất tới người Việt tại Đức và lời khuyên hành động",
  "glossary": [
    {"term": "Thuật ngữ tiếng Đức trong bài", "vi": "Nghĩa tiếng Việt chuẩn", "explain": "Giải thích ngắn gọn 1-2 câu về vai trò thực tế của thuật ngữ này khi sống ở Đức"}
  ],
  "lawStatus": "de-xuat" | "noi-cac" | "quoc-hoi" | "co-hieu-luc" | null,
  "audienceTargets": ["một hoặc nhiều giá trị trong: cu-tru-quoc-tich, ho-kinh-doanh, nguoi-di-lam, gia-dinh, du-hoc-hoc-nghe"],
  "imagePrompt": "Detailed English prompt for a minimalist, authentic European photojournalism illustration matching the story metaphor (natural daylight, shallow depth of field, 35mm documentary style, strictly no text/letters)",
  "imageSearchQuery": "2-4 English keywords for searching a real stock photo on Pexels (e.g. 'Bundestag Berlin parliament', 'German passport desk', 'euro tax documents')",
  "preferVisualMode": "ai" | "photo",
  "category": "một trong ${CATEGORIES.map((c) => `"${c.slug}"`).join(", ")}",
  "tags": ["4-6 từ khóa tiếng Việt và thuật ngữ Đức quan trọng"]
}`;

function userPrompt(i: RewriteInput): string {
  const extraSources =
    i.corroboratingSources && i.corroboratingSources.length > 0
      ? `\nCác nguồn báo Đức cùng đưa tin về sự kiện này để tổng hợp chéo:\n${i.corroboratingSources
          .map((s) => `- ${s.name}: ${s.title}`)
          .join("\n")}`
      : "";

  return `Nguồn chính: ${i.sourceName}
Chuyên mục gợi ý: ${i.categoryHint}
Tiêu đề bản tin gốc (tiếng Đức): ${i.title}
Tóm tắt gốc: ${i.summary}${extraSources}

Dữ kiện nền thu thập từ bài gốc (chỉ dùng để nắm số liệu, mốc thời gian và lập luận của các bên, TUYỆT ĐỐI KHÔNG dịch nguyên văn):
${i.context || "(Dựa trên tiêu đề, tóm tắt và kiến thức nền chuẩn xác về hệ thống pháp luật, chính trị CHLB Đức hiện hành để phân tích sâu)"}`;
}

/**
 * Bộ lọc tất định (Deterministic Linter) quét sạch dấu câu lỗi và các cụm từ mùi AI
 * theo đúng quy chuẩn biên tập trong memory/rejected-patterns.md & editorial-decisions.md.
 */
export function sanitizeEditorialText(raw: string): string {
  if (!raw) return "";
  let s = raw
    // Loại bỏ dấu nháy đơn
    .replace(/'/g, "")
    // Thay thế em-dash và en-dash đứng giữa câu bằng dấu hai chấm hoặc dấu phẩy/gạch nối ngắn
    .replace(/\s+[—–]\s+/g, ": ")
    .replace(/[—]/g, "-")
    // Khử các cụm mở câu mùi AI
    .replace(/(^|\n\n|\.\s+)(Tuy nhiên|Ngoài ra|Tóm lại|Hơn thế nữa|Không thể phủ nhận rằng|Không thể phủ nhận|Hãy cùng khám phá)\s*,\s*/gi, (_, prefix) => prefix)
    // Dọn khoảng trắng thừa
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Nếu câu cuối cùng là câu hỏi tương tác kiểu AI, chuyển thành câu trần thuật
  const lines = s.split("\n\n");
  const lastIdx = lines.length - 1;
  if (lastIdx >= 0 && /\?\s*$/.test(lines[lastIdx])) {
    if (/bạn nghĩ sao|ý kiến của bạn|bạn đã sẵn sàng|bạn có đồng ý/i.test(lines[lastIdx])) {
      lines.pop();
      s = lines.join("\n\n");
    } else {
      lines[lastIdx] = lines[lastIdx].replace(/\?\s*$/, ".");
      s = lines.join("\n\n");
    }
  }
  return s;
}

async function callGemini(input: RewriteInput): Promise<string> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const preferred = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const models = [
    ...new Set([
      preferred,
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
    ]),
  ];
  let lastErr = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: [{ role: "user", parts: [{ text: userPrompt(input) }] }],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(95000),
        },
      );
      if (!res.ok) {
        lastErr = `Gemini (${model}) ${res.status}: ${(await res.text()).slice(0, 180)}`;
        continue;
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (text) return text;
    } catch (e) {
      lastErr = `Gemini (${model}) error: ${String(e).slice(0, 160)}`;
    }
  }
  throw new Error(lastErr || "Không gọi được Gemini API");
}

async function callOpenAI(input: RewriteInput): Promise<string> {
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(input) },
      ],
    }),
    signal: AbortSignal.timeout(110000),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "";
}

async function callAnthropic(input: RewriteInput): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 4500,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt(input) }],
    }),
    signal: AbortSignal.timeout(110000),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content.map((c) => c.text ?? "").join("");
}

function parseJson(raw: string): Record<string, unknown> {
  const start = raw.indexOf("{");
  if (start < 0) throw new Error("AI không trả về JSON");

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return JSON.parse(raw.slice(start, i + 1)) as Record<string, unknown>;
        }
      }
    }
  }

  const end = raw.lastIndexOf("}");
  if (end < 0) throw new Error("AI không trả về JSON hợp lệ");
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

const VALID_LAW_STATUS = new Set<LawStatus>(["de-xuat", "noi-cac", "quoc-hoi", "co-hieu-luc"]);
const VALID_AUDIENCES = new Set<AudienceTarget>([
  "cu-tru-quoc-tich",
  "ho-kinh-doanh",
  "nguoi-di-lam",
  "gia-dinh",
  "du-hoc-hoc-nghe",
]);

export async function rewriteWithAI(input: RewriteInput): Promise<RewriteOutput> {
  const provider = activeProvider();
  if (!provider) throw new Error("Chưa cấu hình khóa AI");
  const raw =
    provider === "gemini"
      ? await callGemini(input)
      : provider === "openai"
        ? await callOpenAI(input)
        : await callAnthropic(input);

  const j = parseJson(raw);
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => sanitizeEditorialText(x.trim())) : [];

  const rawGlossary = Array.isArray(j.glossary) ? j.glossary : [];
  const glossary: GlossaryItem[] = rawGlossary
    .map((g) => {
      if (!g || typeof g !== "object") return null;
      const o = g as Record<string, unknown>;
      const term = str(o.term);
      const vi = sanitizeEditorialText(str(o.vi));
      const explain = sanitizeEditorialText(str(o.explain));
      return term && vi && explain ? { term, vi, explain } : null;
    })
    .filter((x): x is GlossaryItem => x !== null)
    .slice(0, 6);

  const rawLaw = str(j.lawStatus) as LawStatus;
  const lawStatus: LawStatus | null = VALID_LAW_STATUS.has(rawLaw)
    ? rawLaw
    : detectLawStatus(`${input.title} ${input.summary}`);

  const rawAud = Array.isArray(j.audienceTargets) ? j.audienceTargets : [];
  const parsedAud = rawAud.filter((a): a is AudienceTarget => typeof a === "string" && VALID_AUDIENCES.has(a as AudienceTarget));
  const audienceTargets = parsedAud.length > 0 ? parsedAud : detectAudiences(`${input.title} ${input.summary}`);

  const cat = str(j.category);
  const out: RewriteOutput = {
    title: sanitizeEditorialText(str(j.title)),
    sapo: sanitizeEditorialText(str(j.sapo)),
    body: sanitizeEditorialText(str(j.body)),
    keyPoints: list(j.keyPoints).slice(0, 5),
    vnImpact: sanitizeEditorialText(str(j.vnImpact)) || null,
    glossary,
    lawStatus,
    audienceTargets,
    imagePrompt: str(j.imagePrompt) || `Editorial photojournalism in Germany related to ${input.title}, natural daylight, 35mm lens, no text`,
    imageSearchQuery: str(j.imageSearchQuery) || "Berlin Germany architecture",
    preferVisualMode: str(j.preferVisualMode) === "ai" ? "ai" : "photo",
    category: isCategory(cat) ? cat : input.categoryHint,
    tags: list(j.tags).slice(0, 6),
  };

  if (!out.title || !out.body || out.body.length < 400) {
    throw new Error("Bài AI quá ngắn hoặc thiếu trường bắt buộc");
  }
  return out;
}
