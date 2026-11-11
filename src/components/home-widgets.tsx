import Link from "next/link";
import { AUDIENCE_GROUPS, type AudienceTarget } from "@/lib/classify";
import type { ArticleCard } from "@/lib/queries";

export function Ticker({ items }: { items: ArticleCard[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-7xl items-stretch px-4">
        <span className="kicker z-10 flex shrink-0 items-center gap-2 bg-paper py-2.5 pr-4 text-accent">
          <span className="live-dot h-2 w-2 rounded-full bg-accent" />
          Mới nhất
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
          <div className="marquee flex w-max items-center gap-10 py-2.5">
            {loop.map((a, i) => (
              <Link key={`${a.id}-${i}`} href={`/bai-viet/${a.slug}`} className="whitespace-nowrap text-[13.5px] font-medium text-ink-2 hover:text-accent">
                <span className="mr-3 text-rule">■</span>
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudienceFilterBar({ active }: { active?: AudienceTarget | null }) {
  return (
    <div className="border-b border-rule bg-paper-2/45">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
        <span className="kicker shrink-0 pr-1 text-muted">Lọc theo mối quan tâm:</span>
        <Link
          href="/"
          scroll={false}
          className={`shrink-0 rounded-full px-3 py-1 text-[12.5px] font-semibold transition ${
            !active ? "bg-ink text-paper" : "border border-rule bg-white/80 text-ink-2 hover:border-ink"
          }`}
        >
          Tất cả tiêu điểm
        </Link>
        {AUDIENCE_GROUPS.map((g) => {
          const isCurrent = active === g.slug;
          return (
            <Link
              key={g.slug}
              href={isCurrent ? "/" : `/?doi-tuong=${g.slug}`}
              scroll={false}
              title={g.desc}
              className={`shrink-0 rounded-full px-3 py-1 text-[12.5px] font-semibold transition ${
                isCurrent ? "bg-accent text-white" : "border border-rule bg-white/80 text-ink-2 hover:border-ink"
              }`}
            >
              {g.short}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const MILESTONES = [
  {
    date: "27.06.2024",
    title: "Luật Quốc tịch mới (StARModG)",
    text: "Chấp nhận giữ hai quốc tịch (song tịch), rút thời gian cư trú tiêu chuẩn xuống 5 năm.",
    tag: "Quốc tịch",
    href: "/bai-viet/hai-quoc-tich-nguoi-viet-o-duc-can-biet-gi",
  },
  {
    date: "01.06.2024",
    title: "Thẻ cơ hội Chancenkarte",
    text: "Hệ thống tính điểm cho phép lao động ngoài EU sang Đức tối đa 1 năm tìm việc, được làm thêm 20 giờ/tuần.",
    tag: "Di trú",
    href: "/bai-viet/the-co-hoi-chancenkarte-cua-moi-cho-nguoi-tre-viet-nam",
  },
  {
    date: "01.01.2026",
    title: "Lương tối thiểu 13,90 €/giờ",
    text: "Trần thu nhập làm thêm diện Minijob tự động nâng lên 603 €/tháng.",
    tag: "Việc làm",
    href: "/bai-viet/luong-toi-thieu-2026-2027-chu-nha-hang-tiem-nail-can-luu-y",
  },
  {
    date: "01.01.2026",
    title: "Deutschlandticket 63 €/tháng",
    text: "Vé tàu xe toàn quốc áp dụng mức giá mới; có thể giảm xuống dưới 45 € qua Jobticket.",
    tag: "Đời sống",
    href: "/bai-viet/deutschlandticket-63-euro-co-con-dang-mua",
  },
  {
    date: "01.01.2027",
    title: "Lương tối thiểu 14,60 €/giờ",
    text: "Bước tăng thứ hai trong lộ trình, nâng trần Minijob lên khoảng 633 €/tháng.",
    tag: "Việc làm",
    href: "/bai-viet/luong-toi-thieu-2026-2027-chu-nha-hang-tiem-nail-can-luu-y",
  },
  {
    date: "01.01.2027",
    title: "Bắt buộc xuất E-Rechnung",
    text: "Doanh nghiệp có doanh thu > 800.000 € phải xuất hóa đơn điện tử cấu trúc XML/ZUGFeRD.",
    tag: "Thuế & Kinh doanh",
    href: "/bai-viet/ho-kinh-doanh-nguoi-viet-hoa-don-dien-tu-may-tinh-tien",
  },
];

export function LawTimeline() {
  const now = Date.now();
  const parse = (d: string) => {
    const [dd, mm, yy] = d.split(".").map(Number);
    return new Date(yy, mm - 1, dd).getTime();
  };
  const sorted = [...MILESTONES].sort((a, b) => parse(a.date) - parse(b.date));
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4">
      <div className="mb-6 flex items-end justify-between border-t-[3px] border-ink pt-3">
        <div>
          <h2 className="font-serif text-[28px] font-semibold md:text-[34px]">Lộ trình luật & chính sách tại Đức</h2>
          <p className="mt-1 text-sm text-muted">Những cột mốc pháp lý quan trọng nhất tác động tới túi tiền và giấy tờ của người Việt ở Đức.</p>
        </div>
        <Link href="/chuyen-muc/luat-moi" className="kicker hidden pb-2 text-muted hover:text-accent md:block">
          Luật mới →
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {sorted.map((m, i) => {
          const done = parse(m.date) <= now;
          return (
            <Link
              key={i}
              href={m.href}
              className="group relative w-[265px] shrink-0 snap-start border border-rule bg-white/60 p-5 transition hover:-translate-y-0.5 hover:border-ink hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-[22px] font-semibold tabular-nums">{m.date}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                    done ? "bg-ink text-paper" : "bg-gold/20 text-[#7a5800]"
                  }`}
                >
                  {done ? "Đang áp dụng" : "Sắp hiệu lực"}
                </span>
              </div>
              <div className="my-4 h-px bg-rule" />
              <span className="kicker text-accent">{m.tag}</span>
              <h3 className="mt-1 text-[16px] font-bold leading-snug">{m.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{m.text}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
