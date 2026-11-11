import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { LAW_STATUS_LABELS, type LawStatus } from "@/lib/classify";
import { formatTime, timeAgo } from "@/lib/format";
import type { ArticleCard } from "@/lib/queries";

export function CatLabel({ category, light = false }: { category: string; light?: boolean }) {
  const c = getCategory(category);
  return (
    <Link
      href={`/chuyen-muc/${c.slug}`}
      className={`kicker relative z-10 hover:underline ${light ? "text-[#ff6b7f]" : ""}`}
      style={light ? undefined : { color: c.accent }}
    >
      {c.short}
    </Link>
  );
}

export function Meta({ a, light = false }: { a: ArticleCard; light?: boolean }) {
  const law = a.lawStatus && a.lawStatus in LAW_STATUS_LABELS ? LAW_STATUS_LABELS[a.lawStatus as LawStatus] : null;
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] ${light ? "text-white/55" : "text-muted"}`}>
      <time dateTime={new Date(a.publishedAt).toISOString()} suppressHydrationWarning>
        {timeAgo(a.publishedAt)}
      </time>
      {a.kind === "guide" && (
        <>
          <span>·</span>
          <span className="font-semibold text-[#0f766e]">Cẩm nang chuyên sâu</span>
        </>
      )}
      {a.kind === "feature" && a.mode === "ai" && (
        <>
          <span>·</span>
          <span className={light ? "font-semibold text-white/80" : "font-semibold text-ink-2"}>Phân tích sâu</span>
        </>
      )}
      {a.kind === "brief" && (
        <>
          <span>·</span>
          <span>Tin vắn</span>
        </>
      )}
      {law && !light && (
        <>
          <span>·</span>
          <span className="font-medium text-ink-2">{law.label}</span>
        </>
      )}
      {a.sourceName && (
        <>
          <span>·</span>
          <span>Nguồn: {a.sourceName}</span>
        </>
      )}
    </div>
  );
}

function Img({ a, className = "", ratio = "aspect-[3/2]" }: { a: ArticleCard; className?: string; ratio?: string }) {
  return (
    <div className={`img-zoom relative overflow-hidden bg-paper-2 ${ratio} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.image} alt={a.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function LeadStory({ a }: { a: ArticleCard }) {
  return (
    <article className="group relative">
      <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0 z-0" aria-label={a.title} />
      <Img a={a} ratio="aspect-[16/10]" />
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <CatLabel category={a.category} />
          {a.kind !== "brief" && (
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-accent">
              Tiêu điểm phân tích
            </span>
          )}
        </div>
        <h2 className="mt-2 font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.015em] md:text-[46px]">
          <span className="hl">{a.title}</span>
        </h2>
        <p className="mt-4 max-w-2xl font-serif text-[19px] leading-relaxed text-ink-2/85">{a.sapo}</p>
        <div className="mt-4">
          <Meta a={a} />
        </div>
      </div>
    </article>
  );
}

export function StoryCard({
  a,
  size = "md",
  sapo = true,
  light = false,
}: {
  a: ArticleCard;
  size?: "sm" | "md" | "lg";
  sapo?: boolean;
  light?: boolean;
}) {
  const title = size === "lg" ? "text-[28px] md:text-[32px]" : size === "md" ? "text-[21px]" : "text-[18px]";
  return (
    <article className="group relative">
      <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0 z-0" aria-label={a.title} />
      <Img a={a} />
      <div className="mt-3.5">
        <CatLabel category={a.category} light={light} />
        <h3 className={`mt-1.5 font-serif font-semibold leading-[1.18] tracking-[-0.01em] ${title} ${light ? "text-white" : ""}`}>
          <span className="hl">{a.title}</span>
        </h3>
        {sapo && <p className={`mt-2 line-clamp-3 text-[14.5px] leading-relaxed ${light ? "text-white/65" : "text-muted"}`}>{a.sapo}</p>}
        <div className="mt-2.5">
          <Meta a={a} light={light} />
        </div>
      </div>
    </article>
  );
}

export function StoryRow({ a, light = false }: { a: ArticleCard; light?: boolean }) {
  return (
    <article className="group relative flex gap-4">
      <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0 z-0" aria-label={a.title} />
      <div className="min-w-0 flex-1">
        <CatLabel category={a.category} light={light} />
        <h3 className={`mt-1 font-serif text-[18px] font-semibold leading-[1.22] ${light ? "text-white" : ""}`}>
          <span className="hl">{a.title}</span>
        </h3>
        <div className="mt-1.5">
          <Meta a={a} light={light} />
        </div>
      </div>
      <Img a={a} ratio="aspect-square" className="w-[88px] shrink-0 md:w-[104px]" />
    </article>
  );
}

export function TextStory({ a, sapo = true }: { a: ArticleCard; sapo?: boolean }) {
  return (
    <article className="group relative border-t border-rule pt-4">
      <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0 z-0" aria-label={a.title} />
      <CatLabel category={a.category} />
      <h3 className="mt-1.5 font-serif text-[20px] font-semibold leading-[1.2]">
        <span className="hl">{a.title}</span>
      </h3>
      {sapo && <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{a.sapo}</p>}
      <div className="mt-2">
        <Meta a={a} />
      </div>
    </article>
  );
}

export function BriefItem({ a }: { a: ArticleCard }) {
  return (
    <li className="group relative grid grid-cols-[52px_1fr] gap-3 border-t border-rule py-3.5 first:border-t-0">
      <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0 z-0" aria-label={a.title} />
      <time className="pt-0.5 text-[12.5px] font-bold tabular-nums text-accent" suppressHydrationWarning>
        {formatTime(a.publishedAt)}
      </time>
      <div>
        <h4 className="text-[14.5px] font-semibold leading-snug text-ink-2">
          <span className="hl">{a.title}</span>
        </h4>
        <span className="mt-1 block text-[11.5px] text-muted">
          {getCategory(a.category).short}
          {a.sourceName ? ` · ${a.sourceName}` : ""}
        </span>
      </div>
    </li>
  );
}

export function SectionHeading({
  title,
  href,
  light = false,
  children,
}: {
  title: string;
  href?: string;
  light?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`mb-6 flex items-end justify-between gap-4 border-t-[3px] pt-3 ${light ? "border-white" : "border-ink"}`}>
      <div>
        <h2 className={`font-serif text-[28px] font-semibold tracking-[-0.01em] md:text-[34px] ${light ? "text-white" : ""}`}>
          {href ? (
            <Link href={href} className="hover:text-accent">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {children}
      </div>
      {href && (
        <Link href={href} className={`kicker shrink-0 pb-2 ${light ? "text-white/70 hover:text-white" : "text-muted hover:text-accent"}`}>
          Xem tất cả →
        </Link>
      )}
    </div>
  );
}
