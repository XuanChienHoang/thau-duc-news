"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/categories";
import { SOURCES } from "@/lib/sources";
import { Logo } from "./logo";

function todayVi() {
  const d = new Date();
  const wd = new Intl.DateTimeFormat("vi-VN", { weekday: "long", timeZone: "Europe/Berlin" }).format(d);
  const date = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(d);
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)}, ${date}`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(todayVi());
    const onScroll = () => setScrolled(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  if (pathname?.startsWith("/quan-tri")) {
    return (
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <span className="kicker text-muted">Phòng biên tập · {BRAND.name}</span>
        </div>
      </header>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {/* Utility bar */}
      <div className="hidden border-b border-rule text-[12.5px] text-muted md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <span suppressHydrationWarning>{date || "\u00a0"} · Giờ Berlin</span>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Tổng hợp & phân tích từ {SOURCES.length} nguồn báo chí, bộ ngành chính thống của Đức
            </span>
            <Link href="/gioi-thieu" className="hover:text-ink">
              Giới thiệu
            </Link>
            <Link href="/gioi-thieu#ban-quyen" className="hover:text-ink">
              Nguyên tắc biên tập
            </Link>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 pb-4 pt-5 md:pb-6 md:pt-7">
          <button
            onClick={() => setMenu((v) => !v)}
            aria-label="Mở menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-paper-2 md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <p className="hidden max-w-[240px] font-serif text-[15px] italic leading-snug text-muted md:block">
            {BRAND.tagline}
          </p>
          <Link href="/" className="justify-self-center" aria-label={`Trang chủ ${BRAND.name}`}>
            <Logo size="lg" />
          </Link>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setSearch((v) => !v)}
              aria-label="Tìm kiếm"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-paper-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <Link
              href="/#ban-tin"
              className="hidden rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper transition hover:bg-accent md:inline-block"
            >
              Nhận bản tin
            </Link>
          </div>
        </div>
      </header>

      {/* Sticky nav */}
      <nav
        className={`sticky top-0 z-40 border-y border-ink/90 bg-paper/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-[0_6px_20px_-12px_rgba(0,0,0,0.35)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4">
          <Link
            href="/"
            className={`shrink-0 overflow-hidden transition-all duration-300 ${scrolled ? "w-[124px] opacity-100" : "w-0 opacity-0"}`}
            aria-label="Trang chủ"
          >
            <Logo size="sm" />
          </Link>
          <ul className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto md:justify-center">
            <li>
              <Link
                href="/tin-nhanh"
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-[13.5px] font-semibold ${
                  pathname === "/tin-nhanh" ? "text-accent" : "hover:text-accent"
                }`}
              >
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                Tin nhanh
              </Link>
            </li>
            {CATEGORIES.map((c) => {
              const active = pathname === `/chuyen-muc/${c.slug}`;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/chuyen-muc/${c.slug}`}
                    className={`relative block whitespace-nowrap px-3 py-3 text-[13.5px] font-semibold transition-colors ${
                      active ? "text-accent" : "text-ink-2 hover:text-accent"
                    }`}
                  >
                    {c.short === "Người Việt" ? (
                      <span className="rounded-sm bg-accent px-1.5 py-0.5 text-white">Người Việt</span>
                    ) : (
                      c.short
                    )}
                    {active && <span className="absolute inset-x-3 -bottom-px h-[3px] bg-accent" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {search && (
          <div className="border-t border-rule bg-paper">
            <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm: song tịch, lương tối thiểu, Bürgergeld, E-Rechnung…"
                className="flex-1 border-b-2 border-ink bg-transparent py-2 font-serif text-2xl outline-none placeholder:text-muted/60"
              />
              <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">Tìm</button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile drawer */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm overflow-y-auto bg-paper p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setMenu(false)} aria-label="Đóng" className="text-2xl">
                ×
              </button>
            </div>
            <ul className="space-y-1">
              <li>
                <Link href="/tin-nhanh" className="block border-b border-rule py-3 font-serif text-2xl">
                  Tin nhanh
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/chuyen-muc/${c.slug}`} className="block border-b border-rule py-3 font-serif text-2xl">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/gioi-thieu" className="block py-3 text-sm text-muted">
                  Giới thiệu & nguyên tắc biên tập
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
