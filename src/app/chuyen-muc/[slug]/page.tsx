import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadStory, StoryCard, StoryRow } from "@/components/cards";
import { CATEGORIES, getCategory, isCategory } from "@/lib/categories";
import { countByCategory, getLatest } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ trang?: string }> };

const PER_PAGE = 19;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isCategory(slug)) return { title: "Chuyên mục" };
  const c = getCategory(slug);
  return { title: c.name, description: c.description };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  const { trang } = await searchParams;
  const page = Math.max(1, Number(trang) || 1);
  const c = getCategory(slug);
  const [items, total] = await Promise.all([
    getLatest({ category: slug, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    countByCategory(slug),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const [lead, ...rest] = items;
  const side = rest.slice(0, 3);
  const grid = rest.slice(3);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <header className="border-b border-rule py-10 md:py-14">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3" style={{ background: c.accent }} />
          <span className="kicker text-muted">Chuyên mục · {total} bài</span>
        </div>
        <h1 className="mt-3 font-serif text-[44px] font-semibold leading-none tracking-[-0.02em] md:text-[72px]">{c.name}</h1>
        <p className="mt-4 max-w-2xl font-serif text-xl text-muted">{c.description}</p>
        <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto">
          {CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
            <Link key={x.slug} href={`/chuyen-muc/${x.slug}`} className="whitespace-nowrap rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-medium hover:border-ink">
              {x.name}
            </Link>
          ))}
        </div>
      </header>

      {!lead ? (
        <p className="py-24 text-center font-serif text-2xl text-muted">Chưa có bài viết trong chuyên mục này. Tòa soạn đang cập nhật.</p>
      ) : (
        <>
          <section className="grid gap-10 pt-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <LeadStory a={lead} />
            </div>
            <div className="space-y-6 lg:col-span-4 lg:border-l lg:border-rule lg:pl-8">
              {side.map((a) => (
                <div key={a.id} className="border-b border-rule pb-6 last:border-0">
                  <StoryRow a={a} />
                </div>
              ))}
            </div>
          </section>
          {grid.length > 0 && (
            <section className="mt-12 grid gap-x-8 gap-y-12 border-t border-ink pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((a) => (
                <StoryCard key={a.id} a={a} size="sm" />
              ))}
            </section>
          )}
          {pages > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={`/chuyen-muc/${c.slug}?trang=${page - 1}`} className="rounded-full border border-ink px-5 py-2 text-sm font-semibold hover:bg-ink hover:text-paper">
                  ← Mới hơn
                </Link>
              )}
              <span className="px-4 text-sm text-muted">
                Trang {page}/{pages}
              </span>
              {page < pages && (
                <Link href={`/chuyen-muc/${c.slug}?trang=${page + 1}`} className="rounded-full border border-ink px-5 py-2 text-sm font-semibold hover:bg-ink hover:text-paper">
                  Cũ hơn →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
