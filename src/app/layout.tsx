import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/lib/brand";
import { IMAGES } from "@/lib/categories";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin", "vietnamese"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bvp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Tin tức và phân tích chuyên sâu từ nước Đức bằng tiếng Việt: chính trị Berlin, luật mới, di trú, song tịch, kinh tế, thuế và mọi điều chạm tới cộng đồng người Việt tại Đức.",
  openGraph: {
    siteName: BRAND.name,
    locale: "vi_VN",
    type: "website",
    images: [IMAGES.reichstag.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
