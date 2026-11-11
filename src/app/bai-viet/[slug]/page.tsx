import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatLabel, StoryCard, StoryRow } from "@/components/cards";
import { ArticleAudioPlayer, ReadingProgress, ShareBar, ViewTracker } from "@/components/client-bits";
import { Markdown } from "@/components/markdown";
import { BRAND } from "@/lib/brand";
import { getCategory } from "@/lib/categories";
import { AUDIENCE_GROUPS, LAW_STATUS_LABELS, type LawStatus } from "@/lib/classify";
import { formatDateTime, readingMinutes } from "@/lib/format";
import { getArticle, getMostRead, getRelated } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Không tìm thấy bài viết" };
  return {
    title: a.title,
    description: a.sapo,
    openGraph: { title: a.title, description: a.sapo, images: [a.image], type: "article" },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  const [related, mostRead] = await Promise.all([getRelated(a, 4), getMostRead(5)]);
  const cat = getCategory(a.category);
  const minutes = readingMinutes(`${a.sapo} ${a.body}`);
  const lawBadge = a.lawStatus && a.lawStatus in LAW_STATUS_LABELS ? LAW_STATUS_LABELS[a.lawStatus as LawStatus] : null;
  const audiences = AUDIENCE_GROUPS.filter((g) => (a.audienceTargets ?? []).includes(g.slug));
  const sourcesList =
    a.sourcesJson && a.sourcesJson.length > 0
      ? a.sourcesJson
      : a.sourceUrl
        ? [{ name: a.sourceName || "Báo chí Đức", url: a.sourceUrl, title: a.sourceTitle || a.title }]
        : [];

  return (
    <article className="pb-6">
      <ReadingProgress />
      <ViewTracker slug={a.slug} />

      <header className="mx-auto max-w-3xl px-4 pt-10 md:pt-14">
        <div className="flex flex-wrap items-center gap-2.5">
          <CatLabel category={a.category} />
          {a.kind === "guide" && (
            <span className="rounded-full bg-[#0f766e]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0f766e]">CẨM NANG CHUYÊN SÂU</span>
          )}
          {a.kind === "feature" && (
            <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[11px] font-bold text-ink">BÀI PHÂN TÍCH</span>
          )}
          {a.kind === "brief" && (
            <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-[11px] font-bold text-muted">TIN VẮN</span>
          )}
          {lawBadge && (
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${lawBadge.badgeClass}`} title={lawBadge.desc}>
              {lawBadge.label}
            </span>
          )}
        </div>

        <h1 className="mt-3.5 font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[52px]">{a.title}</h1>
        <p className="mt-5 font-serif text-[20px] leading-relaxed text-ink-2/90 md:text-[23px]">{a.sapo}</p>

        {audiences.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">Chạm trực tiếp tới:</span>
            {audiences.map((aud) => (
              <Link
                key={aud.slug}
                href={`/?doi-tuong=${aud.slug}`}
                className="rounded-full border border-rule bg-white/80 px-3 py-0.5 text-[12px] font-semibold text-ink-2 transition hover:border-accent hover:text-accent"
              >
                {aud.short}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-serif text-sm font-bold text-paper">
              {BRAND.initials}
            </span>
            <div className="text-[13px] leading-tight">
              <div className="font-semibold">{BRAND.byline}</div>
              <div className="mt-0.5 text-muted" suppressHydrationWarning>
                {formatDateTime(a.publishedAt)} · {minutes} phút đọc
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ArticleAudioPlayer title={a.title} sapo={a.sapo} body={a.body} />
            <ShareBar title={a.title} />
          </div>
        </div>
      </header>

      <figure className="mx-auto mt-8 max-w-5xl md:px-4">
        <div className="relative aspect-[16/9] overflow-hidden bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <figcaption className="mt-2.5 px-4 text-[12.5px] text-muted md:px-0">
          Hình minh họa biên tập độc lập, không sử dụng ảnh của cơ quan báo chí gốc. {a.imageCredit}.
        </figcaption>
      </figure>

      <div className="mx-auto mt-10 grid max-w-6xl gap-12 px-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="mx-auto w-full max-w-[690px]">
          {a.keyPoints.length > 0 && (
            <section className="mb-10 border-t-[3px] border-accent bg-white/80 p-6 shadow-2xs">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="kicker text-accent">Điểm cốt lõi trong 30 giây</h2>
                {lawBadge && <span className="text-[11.5px] font-medium text-muted">{lawBadge.desc}</span>}
              </div>
              <ol className="space-y-3">
                {a.keyPoints.map((k, i) => (
                  <li key={i} className="grid grid-cols-[26px_1fr] gap-2 text-[15.5px] leading-snug">
                    <span className="font-serif text-lg font-bold leading-none text-accent">{i + 1}</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Markdown source={a.body} />

          {a.vnImpact && (
            <aside className="my-10 border-l-4 border-accent bg-paper-2 p-6">
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">VN</span>
                <h2 className="kicker text-ink">Góc nhìn sát sườn cho người Việt tại Đức</h2>
              </div>
              <p className="font-serif text-[18.5px] leading-relaxed text-ink-2">{a.vnImpact}</p>
            </aside>
          )}

          {a.glossary && a.glossary.length > 0 && (
            <section className="my-10 rounded-sm border border-ink/20 bg-white p-6">
              <div className="mb-4 flex items-center justify-between border-b border-rule pb-3">
                <div>
                  <span className="kicker text-accent">Cẩm nang thuật ngữ</span>
                  <h2 className="mt-0.5 font-serif text-[22px] font-semibold text-ink">Từ điển hành chính & pháp lý Đức – Việt trong bài</h2>
                </div>
                <span className="rounded bg-paper-2 px-2.5 py-1 text-[11px] font-bold text-muted">DE → VI</span>
              </div>
              <dl className="divide-y divide-rule">
                {a.glossary.map((g, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                    <dt className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-[14.5px] font-bold text-accent">{g.term}</span>
                      <span className="text-muted">→</span>
                      <span className="font-semibold text-ink">{g.vi}</span>
                    </dt>
                    <dd className="mt-1 text-[14px] leading-relaxed text-muted">{g.explain}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mt-10 rounded-sm border border-rule bg-paper-2/40 p-5 text-[14px] leading-relaxed text-muted">
            <h2 className="kicker mb-2 text-ink">Nguồn dữ kiện & tuân thủ bản quyền (§ 87f UrhG)</h2>
            {a.mode === "editorial" && (
              <p>
                Bài chuyên đề do <strong>{BRAND.byline}</strong> biên soạn độc lập, tổng hợp từ văn bản pháp luật công khai của Quốc hội Liên bang (Bundestag) và các bộ ngành CHLB Đức. Nội dung mang tính chất thông tin báo chí, không thay thế tư vấn pháp lý hay tư vấn thuế cá nhân.
              </p>
            )}
            {a.mode === "ai" && (
              <p>
                Bài phân tích được <strong>{BRAND.byline}</strong> sáng tác mới hoàn toàn bằng văn phong riêng dựa trên dữ kiện thời sự từ{" "}
                <strong className="text-ink">{a.sourceName}</strong>. Chúng tôi tuân thủ nghiêm ngặt luật bản quyền báo chí Đức: tuyệt đối không dịch nguyên văn, không sao chép cấu trúc bài gốc và không sử dụng hình ảnh của cơ quan báo chí.
              </p>
            )}
            {a.mode === "auto" && (
              <p>
                Tin tổng hợp nhanh từ dữ kiện công khai của <strong className="text-ink">{a.sourceName}</strong>, kèm khung bối cảnh pháp lý do {BRAND.name} biên soạn.
              </p>
            )}
            {sourcesList.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-rule pt-3">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-ink">Đối chiếu bản tin gốc tiếng Đức:</div>
                {sourcesList.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block font-medium text-ink hover:text-accent"
                  >
                    ↗ {s.name}: „{s.title}“
                  </a>
                ))}
              </div>
            )}
          </section>

          {a.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {a.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tim-kiem?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-paper-2 px-3 py-1 text-[13px] font-medium hover:bg-ink hover:text-paper"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-8">
            <div>
              <h2 className="kicker border-b-2 border-ink pb-2">Đọc nhiều nhất</h2>
              <ol className="mt-2">
                {mostRead
                  .filter((m) => m.id !== a.id)
                  .slice(0, 5)
                  .map((m, i) => (
                    <li key={m.id} className="group relative grid grid-cols-[30px_1fr] gap-2 border-b border-rule py-3.5">
                      <Link href={`/bai-viet/${m.slug}`} className="absolute inset-0" aria-label={m.title} />
                      <span className="font-serif text-2xl font-semibold leading-none text-accent">{i + 1}</span>
                      <span className="font-serif text-[16px] font-semibold leading-snug">
                        <span className="hl">{m.title}</span>
                      </span>
                    </li>
                  ))}
              </ol>
            </div>

            {a.glossary && a.glossary.length > 0 && (
              <div className="rounded-sm border border-rule bg-white/80 p-4">
                <div className="kicker text-accent">Thuật ngữ cần nhớ</div>
                <ul className="mt-3 space-y-2.5 text-[13px]">
                  {a.glossary.slice(0, 4).map((g, i) => (
                    <li key={i} className="border-b border-rule pb-2 last:border-b-0 last:pb-0">
                      <div className="font-bold text-ink">{g.term}</div>
                      <div className="text-muted">{g.vi}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <div className="mb-6 border-t-[3px] border-ink pt-3">
            <h2 className="font-serif text-[28px] font-semibold">
              Đọc tiếp trong chuyên mục{" "}
              <Link href={`/chuyen-muc/${cat.slug}`} className="text-accent hover:underline">
                {cat.name}
              </Link>
            </h2>
          </div>
          <div className="hidden gap-8 md:grid md:grid-cols-4">
            {related.map((r) => (
              <StoryCard key={r.id} a={r} size="sm" sapo={false} />
            ))}
          </div>
          <div className="space-y-5 md:hidden">
            {related.map((r) => (
              <StoryRow key={r.id} a={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
