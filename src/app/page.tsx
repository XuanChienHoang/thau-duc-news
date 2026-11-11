import Link from "next/link";
import { after } from "next/server";
import { BriefItem, LeadStory, SectionHeading, StoryCard, StoryRow, TextStory } from "@/components/cards";
import { NewsletterForm } from "@/components/client-bits";
import { AudienceFilterBar, LawTimeline, Ticker } from "@/components/home-widgets";
import { BRAND } from "@/lib/brand";
import { AUDIENCE_GROUPS, type AudienceTarget } from "@/lib/classify";
import { maybeIngest } from "@/lib/ingest";
import { getGuides, getLatest, getLead, getMostRead, type ArticleCard } from "@/lib/queries";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ "doi-tuong"?: string }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  after(() => maybeIngest());

  const params = await searchParams;
  const activeAudience = AUDIENCE_GROUPS.find((g) => g.slug === params?.["doi-tuong"])?.slug ?? null;

  const [lead, all, mostRead, guides] = await Promise.all([
    getLead(),
    getLatest({ limit: 160 }),
    getMostRead(6),
    getGuides(4),
  ]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-serif text-4xl">Tòa soạn đang lên trang…</h1>
        <p className="mt-4 text-muted">Hệ thống đang thu thập tin từ các báo chí chính thống của Đức. Vui lòng quay lại sau ít phút.</p>
      </div>
    );
  }

  const audienceItems = activeAudience
    ? all.filter((a) => (a.audienceTargets ?? []).includes(activeAudience))
    : [];
  const activeAudienceMeta = activeAudience ? AUDIENCE_GROUPS.find((g) => g.slug === activeAudience) : null;

  const used = new Set<number>([lead.id]);
  const take = (pred: (a: ArticleCard) => boolean, n: number) => {
    const out: ArticleCard[] = [];
    for (const a of all) {
      if (out.length >= n) break;
      if (!used.has(a.id) && pred(a)) {
        out.push(a);
        used.add(a.id);
      }
    }
    return out;
  };
  const isLong = (a: ArticleCard) => a.kind !== "brief";

  const latestFeed = all.slice(0, 9);
  const secondary = take((a) => isLong(a) || a.relevance >= 12, 3);
  const row = take(() => true, 4);
  const vn = take((a) => a.category === "nguoi-viet", 4);
  if (vn.length < 4) vn.push(...take((a) => a.category === "di-tru" && a.relevance >= 20, 4 - vn.length));
  const migration = take((a) => a.category === "di-tru", 4);
  const law = take((a) => a.category === "luat-moi", 4);
  const politics = take((a) => a.category === "chinh-tri", 4);
  const economy = take((a) => a.category === "kinh-te", 4);
  const life = take((a) => a.category === "doi-song" || a.category === "thoi-su", 4);

  return (
    <>
      <Ticker items={all.slice(0, 10)} />
      <AudienceFilterBar active={activeAudience} />

      {activeAudienceMeta && audienceItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-8">
          <div className="rounded-sm border-2 border-ink bg-white/80 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
              <div>
                <span className="kicker text-accent">Chuyên đề lọc theo nhóm độc giả</span>
                <h2 className="mt-1 font-serif text-[28px] font-semibold leading-tight md:text-[34px]">
                  {activeAudienceMeta.label}
                </h2>
                <p className="mt-1 text-sm text-muted">{activeAudienceMeta.desc}</p>
              </div>
              <Link href="/" className="rounded-full border border-rule px-4 py-1.5 text-xs font-semibold hover:border-ink">
                Đóng bộ lọc ×
              </Link>
            </div>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {audienceItems.slice(0, 8).map((a) => (
                <StoryCard key={a.id} a={a} size="sm" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top stories */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:border-r lg:border-rule lg:pr-8">
            <LeadStory a={lead} />
          </div>
          <div className="space-y-6 lg:col-span-3 lg:border-r lg:border-rule lg:pr-8">
            {secondary[0] && <StoryCard a={secondary[0]} size="sm" sapo={false} />}
            {secondary.slice(1).map((a) => (
              <TextStory key={a.id} a={a} />
            ))}
          </div>
          <aside className="lg:col-span-3">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <h2 className="kicker flex items-center gap-2 text-ink">
                <span className="live-dot h-2 w-2 rounded-full bg-accent" />
                Dòng thời sự
              </h2>
              <Link href="/tin-nhanh" className="text-[12px] font-semibold text-muted hover:text-accent">
                Tất cả →
              </Link>
            </div>
            <ul>
              {latestFeed.map((a) => (
                <BriefItem key={a.id} a={a} />
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {row.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="grid gap-8 border-t border-ink pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {row.map((a) => (
              <StoryCard key={a.id} a={a} size="sm" />
            ))}
          </div>
        </section>
      )}

      {/* Vietnamese community band */}
      {vn.length > 0 && (
        <section className="mt-16 bg-night py-14 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading title="Người Việt tại Đức" href="/chuyen-muc/nguoi-viet" light>
              <p className="mt-1 text-sm text-white/55">
                Những gì chạm tới cộng đồng hơn 200.000 người Việt: từ chính sách cư trú, nghị trường Berlin đến tiệm nail, quán ăn đầu phố.
              </p>
            </SectionHeading>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <StoryCard a={vn[0]} size="lg" light />
              </div>
              <div className="space-y-6 lg:col-span-5">
                {vn.slice(1).map((a) => (
                  <div key={a.id} className="border-t border-white/15 pt-5 first:border-t-0 first:pt-0">
                    <StoryRow a={a} light />
                  </div>
                ))}
                <div className="rounded-sm border border-white/15 p-5">
                  <p className="font-serif text-[19px] italic leading-snug text-white/85">
                    “Bạn có câu chuyện đời sống, vướng mắc về giấy tờ hành chính hay muốn tòa soạn phân tích sâu một đạo luật mới tại Đức? Hãy gửi thư cho chúng tôi.”
                  </p>
                  <a href={`mailto:${BRAND.email}`} className="mt-3 inline-block text-sm font-semibold text-[#ff6b7f] hover:underline">
                    {BRAND.email} →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Migration + Law */}
      <section className="mx-auto mt-16 grid max-w-7xl gap-12 px-4 lg:grid-cols-2">
        {[
          { title: "Di trú & Quốc tịch", href: "/chuyen-muc/di-tru", items: migration },
          { title: "Luật & Chính sách mới", href: "/chuyen-muc/luat-moi", items: law },
        ].map(
          (s) =>
            s.items.length > 0 && (
              <div key={s.href}>
                <SectionHeading title={s.title} href={s.href} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <StoryRow a={s.items[0]} />
                  </div>
                  {s.items.slice(1).map((a) => (
                    <TextStory key={a.id} a={a} sapo={false} />
                  ))}
                </div>
              </div>
            ),
        )}
      </section>

      <LawTimeline />

      {/* Most read + Guides */}
      <section className="mx-auto mt-16 grid max-w-7xl gap-12 px-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading title="Đọc nhiều nhất" />
          <ol className="space-y-5">
            {mostRead.map((a, i) => (
              <li key={a.id} className="group relative grid grid-cols-[44px_1fr] gap-3 border-b border-rule pb-5">
                <Link href={`/bai-viet/${a.slug}`} className="absolute inset-0" aria-label={a.title} />
                <span className="font-serif text-[44px] font-semibold leading-[0.85] text-accent/90">{i + 1}</span>
                <h3 className="font-serif text-[18px] font-semibold leading-snug">
                  <span className="hl">{a.title}</span>
                </h3>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-8">
          <SectionHeading title="Cẩm nang sống & làm việc ở Đức">
            <p className="mt-1 text-sm text-muted">Giải mã cặn kẽ các quy định cốt lõi kèm bảng đối chiếu và từ điển thuật ngữ hành chính.</p>
          </SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2">
            {guides.map((a) => (
              <StoryCard key={a.id} a={a} size="sm" />
            ))}
          </div>
        </div>
      </section>

      {/* Category rows */}
      {[
        { title: "Chính trị", href: "/chuyen-muc/chinh-tri", items: politics },
        { title: "Kinh tế & Việc làm", href: "/chuyen-muc/kinh-te", items: economy },
        { title: "Đời sống & Thời sự", href: "/chuyen-muc/doi-song", items: life },
      ].map(
        (s) =>
          s.items.length > 0 && (
            <section key={s.href} className="mx-auto mt-16 max-w-7xl px-4">
              <SectionHeading title={s.title} href={s.href} />
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <StoryCard a={s.items[0]} size="md" />
                </div>
                <div className="space-y-6 lg:col-span-6">
                  {s.items.slice(1).map((a) => (
                    <div key={a.id} className="border-b border-rule pb-6 last:border-b-0">
                      <StoryRow a={a} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ),
      )}

      {/* Newsletter */}
      <section id="ban-tin" className="mx-auto mt-20 max-w-7xl scroll-mt-20 px-4">
        <div className="grid items-center gap-8 border-y-[3px] border-double border-ink py-12 md:grid-cols-2">
          <div>
            <span className="kicker text-accent">Bản tin sáng · 7:00 (Giờ Berlin)</span>
            <h2 className="mt-2 font-serif text-[34px] font-semibold leading-tight md:text-[42px]">
              Hiểu thấu nước Đức trong 5 phút mỗi sáng.
            </h2>
            <p className="mt-3 max-w-md text-muted">
              Những chuyển động chính trị lớn nhất, đạo luật sắp có hiệu lực và điều người Việt cần chuẩn bị: gọn gàng trong một email.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
