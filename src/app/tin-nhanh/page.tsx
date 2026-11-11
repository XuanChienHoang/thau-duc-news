import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { CatLabel } from "@/components/cards";
import { formatDateLong, formatTime } from "@/lib/format";
import { lastRun, maybeIngest } from "@/lib/ingest";
import { getLatest, type ArticleCard } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tin nhanh", description: "Dòng thời sự nước Đức cập nhật liên tục bằng tiếng Việt." };

export default async function QuickNewsPage() {
  after(() => maybeIngest());
  const [items, run] = await Promise.all([getLatest({ limit: 80 }), lastRun()]);
  const groups = new Map<string, ArticleCard[]>();
  for (const a of items) {
    const key = formatDateLong(a.publishedAt);
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4">
      <header className="border-b border-rule py-10 md:py-14">
        <span className="kicker flex items-center gap-2 text-accent">
          <span className="live-dot h-2 w-2 rounded-full bg-accent" /> Trực tiếp
        </span>
        <h1 className="mt-3 font-serif text-[44px] font-semibold leading-none tracking-[-0.02em] md:text-[68px]">Tin nhanh</h1>
        <p className="mt-4 max-w-xl font-serif text-xl text-muted">Dòng thời sự nước Đức, cập nhật tự động khoảng mỗi 30 phút từ các cơ quan báo chí uy tín.</p>
        {run && (
          <p className="mt-4 text-[13px] text-muted" suppressHydrationWarning>
            Lần quét nguồn gần nhất: {formatTime(run.startedAt)} · {formatDateLong(run.startedAt)}
          </p>
        )}
      </header>

      {[...groups.entries()].map(([day, list]) => (
        <section key={day} className="mt-10">
          <h2 className="sticky top-[49px] z-10 -mx-4 bg-paper/95 px-4 py-2 font-sans text-[13px] font-bold uppercase tracking-wider text-muted backdrop-blur">{day}</h2>
          <ol className="relative mt-2 border-l-2 border-rule pl-6 md:ml-[70px]">
            {list.map((a) => (
              <li key={a.id} className="group relative pb-8">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-accent" />
                <time className="absolute -left-[100px] top-0.5 hidden w-[60px] text-right text-[13px] font-bold tabular-nums text-accent md:block" suppressHydrationWarning>
                  {formatTime(a.publishedAt)}
                </time>
                <div className="flex items-center gap-2 md:hidden">
                  <time className="text-[12.5px] font-bold text-accent" suppressHydrationWarning>
                    {formatTime(a.publishedAt)}
                  </time>
                </div>
                <CatLabel category={a.category} />
                <Link href={`/bai-viet/${a.slug}`} className="block">
                  <h3 className="mt-1 font-serif text-[22px] font-semibold leading-snug">
                    <span className="hl">{a.title}</span>
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-muted">{a.sapo}</p>
                </Link>
                {a.sourceName && <span className="mt-2 block text-[12px] text-muted">Nguồn: {a.sourceName}</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
