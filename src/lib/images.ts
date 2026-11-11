import fs from "node:fs";
import path from "node:path";
import { BRAND } from "./brand";
import { type CategorySlug, type Img, pickImage } from "./categories";

export type VisualRequest = {
  slug: string;
  category: CategorySlug;
  imagePrompt?: string;
  imageSearchQuery?: string;
  preferMode?: "ai" | "photo";
  usedUrls?: Set<string>;
};

/**
 * Tạo ảnh minh họa biên tập bằng Gemini Image Generation (European Editorial Photojournalism style).
 * Lưu file trực tiếp vào public/images/generated/[slug].jpg để phục vụ tĩnh tốc độ cao.
 */
async function generateAIEditorialImage(slug: string, prompt: string): Promise<Img | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || !prompt.trim()) return null;

  const models = [
    process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
  ];

  const fullPrompt = `Editorial photojournalism photograph for a prestigious German-Vietnamese broadsheet newspaper (like DIE ZEIT or The New York Times).
Subject: ${prompt.trim()}
Aesthetic rules: Authentic European documentary photography, natural soft daylight, shallow depth of field (35mm or 50mm lens), subtle film grain, muted realistic colors.
Strict prohibitions: NO text, NO words, NO letters, NO signs with text, NO watermarks, NO futuristic neon or sci-fi glow, NO cartoon/3D look.`;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
            },
          }),
          signal: AbortSignal.timeout(35000),
        },
      );
      if (!res.ok) continue;
      const data = (await res.json()) as {
        candidates?: {
          content?: {
            parts?: { inlineData?: { mimeType?: string; data?: string } }[];
          };
        }[];
      };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find((p) => p.inlineData?.data);
      if (!imgPart?.inlineData?.data) continue;

      const ext = imgPart.inlineData.mimeType?.includes("png") ? "png" : "jpg";
      const fileName = `${slug.slice(0, 70)}.${ext}`;
      const outDir = path.join(process.cwd(), "public", "images", "generated");
      fs.mkdirSync(outDir, { recursive: true });
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(imgPart.inlineData.data, "base64"));

      return {
        src: `/images/generated/${fileName}`,
        credit: `Ảnh minh họa tạo bằng AI · Phòng Đồ họa ${BRAND.name}`,
      };
    } catch {
      // try next model or fall back to Pexels
    }
  }
  return null;
}

/**
 * Tìm ảnh thực tế theo từ khóa ngữ cảnh từ Pexels API (miễn phí bản quyền, ghi rõ tên tác giả).
 */
async function searchPexelsImage(query: string, seed: string, usedUrls?: Set<string>): Promise<Img | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || !query.trim()) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query.trim())}&orientation=landscape&size=large&per_page=15`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      photos?: {
        photographer?: string;
        src?: { large2x?: string; large?: string };
      }[];
    };
    const photos = (data.photos ?? []).filter((p) => p.src?.large2x || p.src?.large);
    if (!photos.length) return null;

    // Ưu tiên chọn ảnh chưa xuất hiện trong các bài gần đây
    for (const p of photos) {
      const candidateUrl = (p.src?.large2x || p.src?.large)!;
      if (!usedUrls?.has(candidateUrl)) {
        usedUrls?.add(candidateUrl);
        return {
          src: candidateUrl,
          credit: `Ảnh minh họa: ${p.photographer || "Pexels"} / Pexels`,
        };
      }
    }

    const idx = Math.abs(seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % photos.length;
    const chosen = photos[idx];
    return {
      src: (chosen.src?.large2x || chosen.src?.large)!,
      credit: `Ảnh minh họa: ${chosen.photographer || "Pexels"} / Pexels`,
    };
  } catch {
    return null;
  }
}

/**
 * Kết hợp thông minh: AI tạo ảnh minh họa biên tập + Pexels API tìm ảnh thực tế theo từ khóa bài viết.
 * Đảm bảo 0% sử dụng ảnh của báo Đức, không bao giờ vi phạm bản quyền ảnh báo chí.
 */
export async function resolveArticleImage(req: VisualRequest): Promise<Img> {
  const preferAI = req.preferMode === "ai";

  if (preferAI && req.imagePrompt) {
    const aiImg = await generateAIEditorialImage(req.slug, req.imagePrompt);
    if (aiImg) return aiImg;
  }

  if (req.imageSearchQuery) {
    const pexelsImg = await searchPexelsImage(req.imageSearchQuery, req.slug, req.usedUrls);
    if (pexelsImg) return pexelsImg;
  }

  if (!preferAI && req.imagePrompt) {
    const aiImg = await generateAIEditorialImage(req.slug, req.imagePrompt);
    if (aiImg) return aiImg;
  }

  return pickImage(req.category, req.slug);
}

