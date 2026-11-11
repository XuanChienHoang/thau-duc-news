import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <span className="kicker text-accent">Lỗi 404</span>
      <h1 className="mt-3 font-serif text-5xl font-semibold">Trang này không còn trên mặt báo.</h1>
      <p className="mt-4 text-muted">Bài viết có thể đã được gỡ hoặc đường dẫn bị sai.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-accent">
        Về trang chủ
      </Link>
    </div>
  );
}
