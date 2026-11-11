export type BrandOption = {
  id: string;
  first: string;
  second: string;
  name: string;
  tagline: string;
  subtitle: string;
  domain: string;
  email: string;
  byline: string;
  initials: string;
  meaning: string;
};

/**
 * Các phương án tên tờ báo độc quyền, chưa từng xuất hiện trên thị trường báo chí Việt tại Đức.
 * Chỉ cần đổi ACTIVE_BRAND_ID để đổi toàn bộ nhận diện trên website.
 */
export const BRAND_OPTIONS: Record<string, BrandOption> = {
  "thau-duc": {
    id: "thau-duc",
    first: "Thấu",
    second: "Đức",
    name: "Thấu·Đức",
    tagline: "Thấu hiểu nước Đức, kể lại bằng tiếng Việt.",
    subtitle: "Chính sự, luật mới và nhịp sống nước Đức nhìn từ lăng kính người Việt",
    domain: "thauduc.de",
    email: "toasoan@thauduc.de",
    byline: "Ban biên tập Thấu·Đức",
    initials: "TĐ",
    meaning:
      "“Thấu” trong thấu hiểu, thấu suốt và thấu cảm: giúp người Việt không chỉ đọc tin lướt qua mà hiểu thấu hậu trường chính trường Berlin, hiểu thấu từng điều khoản luật mới và từng lá thư hành chính nơi xứ người.",
  },
  "lang-kinh-duc": {
    id: "lang-kinh-duc",
    first: "Lăng Kính",
    second: "Đức",
    name: "Lăng Kính·Đức",
    tagline: "Soi chiếu nước Đức bằng tiếng Việt rõ ràng và sâu sắc.",
    subtitle: "Báo điện tử phân tích thời sự, pháp luật và đời sống tại Đức",
    domain: "langkinhduc.de",
    email: "toasoan@langkinhduc.de",
    byline: "Ban biên tập Lăng Kính·Đức",
    initials: "LK",
    meaning:
      "Lấy cảm hứng từ truyền thống báo chí phân tích của Đức (Der Spiegel, Der Tagesspiegel), bóc tách đa chiều mọi chính sách tác động đến cộng đồng người Việt.",
  },
  "mach-duc": {
    id: "mach-duc",
    first: "Mạch",
    second: "Đức",
    name: "Mạch·Đức",
    tagline: "Bắt mạch nước Đức mỗi ngày bằng tiếng Việt.",
    subtitle: "Dòng chảy chính trị, kinh tế, di trú và cộng đồng Việt tại Đức",
    domain: "machduc.de",
    email: "toasoan@machduc.de",
    byline: "Ban biên tập Mạch·Đức",
    initials: "MĐ",
    meaning:
      "Ngắn gọn, hiện đại: bắt đúng mạch ngầm của các thay đổi luật lệ, kinh tế và đời sống xã hội Đức.",
  },
  "spree-nhat-bao": {
    id: "spree-nhat-bao",
    first: "Spree",
    second: "Nhật Báo",
    name: "Spree·Nhật Báo",
    tagline: "Từ dòng sông Spree đến mọi mái nhà Việt trên đất Đức.",
    subtitle: "Chuyên trang thời sự, chính sách và đời sống người Việt tại CHLB Đức",
    domain: "spreenhatbao.de",
    email: "toasoan@spreenhatbao.de",
    byline: "Ban biên tập Spree·Nhật Báo",
    initials: "SP",
    meaning:
      "Dòng sông Spree chảy qua tòa nhà Quốc hội Bundestag và khu vực Đông Berlin – nơi gắn liền với lịch sử hội nhập của nhiều thế hệ người Việt tại Đức.",
  },
};

export const ACTIVE_BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || "thau-duc";

export const BRAND: BrandOption = BRAND_OPTIONS[ACTIVE_BRAND_ID] ?? BRAND_OPTIONS["thau-duc"];

