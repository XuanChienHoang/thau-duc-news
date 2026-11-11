import type { Metadata } from "next";
import Link from "next/link";
import { activeProvider } from "@/lib/ai";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { formatDateTime, timeAgo } from "@/lib/format";
import { isIngesting, queueStats } from "@/lib/ingest";
import { getSource, SOURCES } from "@/lib/sources";
import { getArticles, getFeedQueue, getIngestRuns, getSubscribers } from "@/lib/storage";
import { ingestCustomUrlAction, prioritizeAction, runIngestAction, upgradeArticleAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Phòng biên tập", robots: { index: false } };

const STATUS: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  skipped: "bg-stone-200 text-stone-600",
  duplicate: "bg-sky-100 text-sky-800",
  error: "bg-red-100 text-red-700",
  processing: "bg-violet-100 text-violet-800",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const required = process.env.ADMIN_TOKEN;
  if (required && token !== required) {
    return (
      <form className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-serif text-3xl font-semibold">Phòng biên tập {BRAND.name}</h1>
        <p className="mt-2 text-sm text-muted">Nhập mã truy cập (ADMIN_TOKEN).</p>
        <input name="token" type="password" className="mt-6 w-full rounded border border-rule bg-white px-4 py-3" />
        <button className="mt-3 w-full rounded bg-ink py-3 font-semibold text-paper">Vào</button>
      </form>
    );
  }

  const provider = activeProvider();
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const hasPexels = Boolean(process.env.PEXELS_API_KEY);

  const runs = getIngestRuns().slice(-6).reverse();
  const allQueue = getFeedQueue();
  const items = allQueue.slice(-60).reverse();
  const stats = await queueStats();
  const subs = getSubscribers();
  const articles = getArticles();
  const publishedList = articles.slice(0, 25).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category,
    kind: a.kind,
    mode: a.mode,
    publishedAt: a.publishedAt,
    wordCount: a.body.split(/\s+/).filter(Boolean).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker text-accent">Tòa soạn tự động · {BRAND.name}</span>
          <h1 className="mt-1 font-serif text-4xl font-semibold">Phòng biên tập trung tâm</h1>
          <p className="mt-1 text-sm text-muted">
            Hệ thống tự động quét {SOURCES.length} nguồn báo Đức & radar cộng đồng Việt mỗi 30 phút.
          </p>
        </div>
        <form action={runIngestAction}>
          <input type="hidden" name="token" value={token} />
          <button className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark">
            {isIngesting() ? "Đang quét & biên tập…" : "Quét 24 nguồn Đức & xuất bản ngay"}
          </button>
        </form>
      </div>

      {/* Status Cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div
          className={`rounded border p-5 md:col-span-2 ${
            provider ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
          }`}
        >
          <div className="kicker text-muted">Động cơ Biên tập & Đồ họa</div>
          <div className="mt-1 text-xl font-bold">
            {provider ? `AI Phân tích chuyên sâu (${provider === "gemini" ? geminiModel : provider})` : "Tin vắn tự động"}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
            Mô hình: <strong>Git-backed Flat Storage (như PhytoCodex)</strong>. Hình ảnh:{" "}
            <strong>
              {provider ? "Gemini AI Photojournalism" : "Stock"} + {hasPexels ? "Pexels Live Search API" : "Kho ảnh chọn lọc"}
            </strong>{" "}
            (0% dùng ảnh báo gốc). Độ dài mục tiêu: 950–1.500 chữ/bài kèm bảng so sánh & từ điển thuật ngữ.
          </p>
        </div>
        <div className="rounded border border-rule bg-white p-5">
          <div className="kicker text-muted">Hàng đợi RSS</div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[12px]">
            {Object.entries(stats).map(([k, v]) => (
              <span key={k} className={`rounded-full px-2 py-0.5 font-semibold ${STATUS[k] ?? "bg-stone-100"}`}>
                {k}: {v}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded border border-rule bg-white p-5">
          <div className="kicker text-muted">Độc giả đăng ký bản tin</div>
          <div className="mt-1 text-3xl font-bold">{subs.length}</div>
        </div>
      </div>

      {/* Instant Custom German URL to Deep-Dive Article */}
      <section className="mt-8 rounded border-2 border-ink bg-white p-6">
        <span className="kicker text-accent">Biên tập theo yêu cầu</span>
        <h2 className="mt-1 font-serif text-2xl font-semibold">Dán link báo Đức bất kỳ → Viết bài phân tích chuyên sâu ngay</h2>
        <p className="mt-1 text-sm text-muted">
          Dán đường dẫn từ tagesschau, DER SPIEGEL, ZEIT, FAZ, rbb24, Bundestag... Hệ thống sẽ tự động bóc tách dữ kiện, viết bài
          phân tích dài 1.000+ chữ theo giọng văn tòa soạn và tạo ảnh minh họa mới.
        </p>
        <form action={ingestCustomUrlAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="token" value={token} />
          <input
            name="url"
            type="url"
            required
            placeholder="https://www.tagesschau.de/inland/..."
            className="flex-1 rounded border border-rule bg-paper/50 px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
          <select
            name="category"
            className="rounded border border-rule bg-paper/50 px-3 py-2.5 text-sm font-medium outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="rounded bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent">
            Cào & Viết bài chuyên sâu →
          </button>
        </form>
      </section>

      {/* Published Articles */}
      <h2 className="mt-10 font-serif text-2xl font-semibold">Bài đã xuất bản ({publishedList.length} bài)</h2>
      <div className="mt-3 overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Tiêu đề bài viết</th>
              <th className="p-3">Chuyên mục</th>
              <th className="p-3">Độ dài</th>
              <th className="p-3">Loại bài</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {publishedList.map((a) => (
              <tr key={a.id} className="border-t border-rule align-top">
                <td className="max-w-md p-3">
                  <Link href={`/bai-viet/${a.slug}`} className="font-semibold text-ink hover:text-accent">
                    {a.title}
                  </Link>
                  <div className="text-[11px] text-muted" suppressHydrationWarning>
                    {timeAgo(a.publishedAt)}
                  </div>
                </td>
                <td className="p-3">{getCategory(a.category).short}</td>
                <td className="p-3 font-mono text-xs">
                  <span className={a.wordCount < 400 ? "font-bold text-amber-700" : "font-semibold text-emerald-700"}>
                    ~{a.wordCount} chữ
                  </span>
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-[11px] font-semibold">
                    {a.kind} · {a.mode}
                  </span>
                </td>
                <td className="p-3">
                  <form action={upgradeArticleAction}>
                    <input type="hidden" name="token" value={token} />
                    <input type="hidden" name="id" value={a.id} />
                    <button className="whitespace-nowrap text-[12px] font-semibold text-accent hover:underline">
                      {a.wordCount < 450 ? "⚡ Nâng cấp bài sâu (AI)" : "Viết lại bằng AI"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-serif text-2xl font-semibold">Lượt quét gần đây</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {runs.map((r) => (
          <details key={r.id} className="rounded border border-rule bg-white p-4">
            <summary className="cursor-pointer text-sm">
              <strong suppressHydrationWarning>{formatDateTime(r.startedAt)}</strong> · {r.mode} · +{r.fetched} tin · {r.created}{" "}
              bài {r.finishedAt ? "" : "· đang chạy"}
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-[12px] text-muted">{r.log}</pre>
          </details>
        ))}
        {!runs.length && <p className="text-sm text-muted">Chưa có lượt quét nào.</p>}
      </div>

      <h2 className="mt-10 font-serif text-2xl font-semibold">Tin thu thập từ báo Đức ({items.length} mới nhất)</h2>
      <div className="mt-3 overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Điểm</th>
              <th className="p-3">Tiêu đề gốc (tiếng Đức)</th>
              <th className="p-3">Nguồn</th>
              <th className="p-3">Chuyên mục</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-rule align-top">
                <td className="p-3 font-bold tabular-nums">{i.relevance}</td>
                <td className="max-w-md p-3">
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                    {i.title}
                  </a>
                  <div className="text-[11px] text-muted" suppressHydrationWarning>
                    {timeAgo(i.publishedAt)}
                  </div>
                </td>
                <td className="p-3 text-muted">{getSource(i.sourceId)?.name ?? i.sourceId}</td>
                <td className="p-3">{getCategory(i.category).short}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[i.status] ?? ""}`}>
                    {i.status}
                  </span>
                </td>
                <td className="p-3">
                  {i.status !== "done" && (
                    <form action={prioritizeAction}>
                      <input type="hidden" name="token" value={token} />
                      <input type="hidden" name="id" value={i.id} />
                      <button className="whitespace-nowrap text-[12px] font-semibold text-accent hover:underline">
                        Ưu tiên đăng
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
