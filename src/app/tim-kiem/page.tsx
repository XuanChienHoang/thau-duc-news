import type { Metadata } from "next";
import { StoryRow } from "@/components/cards";
import { searchArticles } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tìm kiếm" };

const SUGGEST = ["quốc tịch", "lương tối thiểu", "Bürgergeld", "đoàn tụ", "thuế", "Deutschlandticket", "Chancenkarte", "Merz"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const results = term ? await searchArticles(term) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <form action="/tim-kiem" className="border-b-2 border-ink">
        <input
          name="q"
          defaultValue={term}
          placeholder="Bạn muốn tìm gì?"
          className="w-full bg-transparent py-3 font-serif text-[36px] outline-none placeholder:text-muted/50 md:text-[48px]"
        />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGEST.map((s) => (
          <a key={s} href={`/tim-kiem?q=${encodeURIComponent(s)}`} className="rounded-full bg-paper-2 px-3 py-1 text-[13px] hover:bg-ink hover:text-paper">
            {s}
          </a>
        ))}
      </div>
      {term && (
        <p className="mt-8 text-sm text-muted">
          {results.length} kết quả cho „<strong className="text-ink">{term}</strong>“
        </p>
      )}
      <div className="mt-6 space-y-6">
        {results.map((a) => (
          <div key={a.id} className="border-b border-rule pb-6">
            <StoryRow a={a} />
          </div>
        ))}
      </div>
    </div>
  );
}
