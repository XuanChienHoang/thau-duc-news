import type { Metadata } from "next";
import { BRAND, BRAND_OPTIONS } from "@/lib/brand";
import { SOURCES } from "@/lib/sources";

export const metadata: Metadata = { title: "Giới thiệu & nguyên tắc biên tập" };

export default function AboutPage() {
  const sources = [...new Map(SOURCES.filter((s) => s.tier !== "radar").map((s) => [s.name, s])).values()];
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <span className="kicker text-accent">Về {BRAND.name}</span>
      <h1 className="mt-3 font-serif text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[58px]">
        {BRAND.tagline}
      </h1>
      <div className="article-body mt-10">
        <p>
          {BRAND.name} ra đời từ một nhu cầu rất thực tế: hơn 200.000 người Việt đang sống, làm việc và học tập tại CHLB Đức cần một tờ báo tiếng Việt không chỉ dịch vội vài dòng tin vắn, mà giải thích thấu đáo chuyện gì đang thực sự diễn ra quanh mình: từ phiên tranh luận tại Quốc hội Liên bang (Bundestag) ở Berlin cho đến lá thư thông báo mới của Sở Thuế (Finanzamt) hay Sở Ngoại kiều (Ausländerbehörde).
        </p>
        <p>{BRAND.meaning}</p>
        <p>
          Hệ thống của chúng tôi theo dõi liên tục 24 luồng tin tức từ các cơ quan báo chí chính thống, đài truyền hình công lập các bang và các bộ ngành liên bang Đức, kết hợp với bộ radar từ khóa chuyên biệt về cộng đồng người Việt. Mỗi chủ đề quan trọng đều được {BRAND.byline} phân tích sâu bằng giọng văn kể chuyện đời thường, kèm bảng đối chiếu chính sách và từ điển thuật ngữ hành chính Đức – Việt.
        </p>
        <h2>Hệ thống nguồn tin chính thống chúng tôi theo dõi</h2>
        <ul>
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.homepage} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <section id="ban-quyen" className="mt-14 scroll-mt-24 border-t-[3px] border-ink pt-6">
        <h2 className="font-serif text-[34px] font-semibold">Nguyên tắc biên tập & tuân thủ bản quyền (§ 87f UrhG)</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            [
              "Không sao chép hay dịch nguyên văn",
              "Chúng tôi chỉ chắt lọc dữ kiện khách quan (sự việc, con số thống kê, mốc hiệu lực đạo luật) – vốn không thuộc đối tượng bảo hộ bản quyền – và sáng tác mới 100% bài phân tích bằng cấu trúc, lập luận và ẩn dụ riêng của tòa soạn.",
            ],
            [
              "Tổng hợp đa nguồn & ghi nguồn minh bạch",
              "Mỗi bài viết đều nêu rõ cơ quan báo chí cung cấp dữ kiện và dẫn link trực tiếp về bản gốc tiếng Đức, giúp bạn đọc dễ dàng đối chiếu và tôn trọng giá trị của tờ báo gốc.",
            ],
            [
              "Tuyệt đối không dùng ảnh báo gốc",
              "100% hình ảnh minh họa trên trang được tạo mới bằng AI theo phong cách nhiếp ảnh báo chí châu Âu hoặc truy vấn hợp pháp qua API Pexels / Unsplash có ghi tên tác giả đầy đủ.",
            ],
            [
              "Chống văn phong dịch máy (Anti-AI Slop)",
              "Mọi bài viết đều đi qua bộ lọc biên tập khắt khe: loại bỏ câu chữ dịch máy ngô nghê, giải thích rõ thuật ngữ tiếng Đức hành chính và luôn đặt câu hỏi: đạo luật này tác động thế nào tới túi tiền và giấy tờ của người Việt tại Đức.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="border border-rule bg-white/60 p-5">
              <h3 className="text-[16px] font-bold">{t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[14px] text-muted">
          Mọi ý kiến đóng góp của độc giả hoặc yêu cầu liên hệ từ các cơ quan báo chí, vui lòng gửi về{" "}
          <a className="font-semibold text-ink underline" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>
          .
        </p>
      </section>

      <section className="mt-14 border-t border-rule pt-6">
        <span className="kicker text-muted">Các phương án định danh thương hiệu</span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.values(BRAND_OPTIONS).map((b) => (
            <div
              key={b.id}
              className={`rounded-sm border p-4 ${b.id === BRAND.id ? "border-accent bg-white" : "border-rule bg-paper-2/40"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-bold">{b.name}</span>
                <span className="text-xs font-mono text-muted">{b.domain}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-ink-2">{b.tagline}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{b.meaning}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
