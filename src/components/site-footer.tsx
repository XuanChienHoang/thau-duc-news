import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/categories";
import { SOURCES } from "@/lib/sources";
import { Logo } from "./logo";

export function SiteFooter() {
  const sourceNames = [...new Set(SOURCES.filter((s) => s.tier !== "radar").map((s) => s.name))];
  return (
    <footer className="mt-20 bg-night text-white/75">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo size="sm" light />
            <p className="mt-5 max-w-sm font-serif text-lg leading-relaxed text-white/80">
              Tờ báo điện tử phân tích chuyên sâu dành cho người Việt ở Đức. Chúng tôi theo dõi chính trường và báo chí Đức mỗi ngày, rồi kể lại cho bạn bằng tiếng Việt rõ ràng, gần gũi và đầy đủ bối cảnh.
            </p>
            <p className="mt-3 text-xs text-white/45">{BRAND.meaning}</p>
          </div>
          <div className="md:col-span-3">
            <h3 className="kicker mb-4 text-white">Chuyên mục</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/chuyen-muc/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-5">
            <h3 className="kicker mb-4 text-white">Hệ thống nguồn tin chính thống của Đức</h3>
            <div className="flex flex-wrap gap-2">
              {sourceNames.map((n) => (
                <span key={n} className="rounded-full border border-white/15 px-3 py-1 text-[12px]">
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-white/55">
              Mọi bài viết đều được {BRAND.byline} sáng tác mới hoàn toàn dựa trên dữ kiện công khai và luôn dẫn link về bản gốc tiếng Đức. Chúng tôi tuyệt đối không sử dụng hình ảnh của các cơ quan báo chí – hình minh họa được tạo bằng AI hoặc lấy từ kho ảnh bản quyền mở (Pexels / Unsplash).
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[12.5px] text-white/45 md:flex-row">
          <span>
            © {new Date().getFullYear()} {BRAND.name} ({BRAND.domain}). Thông tin mang tính tham khảo báo chí, không thay thế tư vấn pháp lý hay tư vấn thuế.
          </span>
          <div className="flex gap-5">
            <Link href="/gioi-thieu" className="hover:text-white">
              Giới thiệu
            </Link>
            <Link href="/gioi-thieu#ban-quyen" className="hover:text-white">
              Bản quyền & nguồn tin
            </Link>
            <Link href="/quan-tri" className="hover:text-white">
              Phòng biên tập
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
