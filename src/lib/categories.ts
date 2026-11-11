export type CategorySlug =
  | "thoi-su"
  | "chinh-tri"
  | "di-tru"
  | "luat-moi"
  | "kinh-te"
  | "doi-song"
  | "nguoi-viet";

export type Category = {
  slug: CategorySlug;
  name: string;
  short: string;
  description: string;
  accent: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "thoi-su",
    name: "Thời sự",
    short: "Thời sự",
    description: "Những diễn biến đáng chú ý nhất trên khắp nước Đức trong ngày.",
    accent: "#C8102E",
  },
  {
    slug: "chinh-tri",
    name: "Chính trị",
    short: "Chính trị",
    description: "Quốc hội Bundestag, Chính phủ Liên bang, các đảng phái và hậu trường quyền lực ở Berlin.",
    accent: "#1F3A5F",
  },
  {
    slug: "di-tru",
    name: "Di trú & Quốc tịch",
    short: "Di trú",
    description: "Cư trú, visa, song tịch, đoàn tụ gia đình, lao động tay nghề: phân tích từng điều khoản thay đổi.",
    accent: "#0F766E",
  },
  {
    slug: "luat-moi",
    name: "Luật & Chính sách mới",
    short: "Luật mới",
    description: "Dự thảo đang bàn, đạo luật vừa thông qua, quy định sắp có hiệu lực và các phán quyết quan trọng của tòa án Đức.",
    accent: "#7C2D12",
  },
  {
    slug: "kinh-te",
    name: "Kinh tế & Việc làm",
    short: "Kinh tế",
    description: "Lương tối thiểu, thuế, bảo hiểm, thị trường lao động và bài toán chi phí của các hộ kinh doanh người Việt.",
    accent: "#A16207",
  },
  {
    slug: "doi-song",
    name: "Đời sống",
    short: "Đời sống",
    description: "Nhà ở, tàu xe, y tế, trường học của con cái: những chuyện sát sườn mỗi ngày trên đất Đức.",
    accent: "#4338CA",
  },
  {
    slug: "nguoi-viet",
    name: "Người Việt tại Đức",
    short: "Người Việt",
    description: "Cộng đồng hơn 200.000 người Việt, câu chuyện ba thế hệ và mọi vấn đề chạm trực tiếp tới bà con xa xứ.",
    accent: "#B91C1C",
  },
];

export function getCategory(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

export function isCategory(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

export type Img = { src: string; credit: string };

const px = (id: string, author: string, ext = "jpeg"): Img => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400`,
  credit: `Ảnh minh họa: ${author} / Pexels`,
});

const un = (id: string, author: string): Img => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`,
  credit: `Ảnh minh họa: ${author} / Unsplash`,
});

export const IMAGES = {
  politics: px("532867", "Felix Mittermeier"),
  politics2: px("32429543", "Maisy Yates"),
  migration: px("6814526", "cottonbro studio"),
  law: px("32201000", "Joachim Schnürle"),
  economy: px("8065262", "Ibrahim Boran"),
  work: un("1556742049-0cfed4f6a45d", "Blake Wisz"),
  life: px("20291344", "Irina Nesterenko"),
  community: un("1555396273-367ea4eb4db5", "nenadovic"),
  community2: un("1517248135467-4c7edcad34c4", "Jason Leung"),
  train: un("1515165562839-978bbcf18277", "Jannis Lucas"),
  berlinWinter: px("20291344", "Irina Nesterenko"),
  berlinNight: px("19615598", "Abdulmomen Bsruki"),
  berlinTower: px("36937034", "Max Kladitin"),
  brandenburg: px("36937039", "Max Kladitin"),
  flag: px("9930672", "Claudio Mota"),
  reichstag: px("532867", "Felix Mittermeier"),
  reichstagWinter: px("35098052", "Osviel Rodriguez Valdés"),
  flagBuilding: px("32429543", "Maisy Yates"),
  binder: px("32201000", "Joachim Schnürle"),
  signing: px("6814526", "cottonbro studio"),
  folders: px("357514", "Pixabay"),
  euro: px("8065262", "Ibrahim Boran"),
  euroPrice: px("10356910", "Tim Heckmann", "png"),
  euroCards: px("10149295", "Engin Akyurt"),
  frankfurtSkyline: un("1564501049412-61c2a3083791", "Niklas Weiss"),
  germanCourt: un("1589829545856-d10d557cf95f", "Tingey Injury Law Firm"),
  hospitalCare: un("1519494026892-80bbd2d6fd0d", "Martha Dominguez"),
  schoolClassroom: un("1503676260728-1c00da094a0b", "Element5 Digital"),
} satisfies Record<string, Img>;

const POOLS: Record<CategorySlug, Img[]> = {
  "thoi-su": [IMAGES.berlinWinter, IMAGES.brandenburg, IMAGES.berlinTower, IMAGES.train, IMAGES.berlinNight, IMAGES.life],
  "chinh-tri": [IMAGES.reichstag, IMAGES.flagBuilding, IMAGES.reichstagWinter, IMAGES.flag, IMAGES.politics2],
  "di-tru": [IMAGES.signing, IMAGES.binder, IMAGES.folders, IMAGES.community2, IMAGES.migration],
  "luat-moi": [IMAGES.germanCourt, IMAGES.binder, IMAGES.signing, IMAGES.folders, IMAGES.law],
  "kinh-te": [IMAGES.euro, IMAGES.frankfurtSkyline, IMAGES.work, IMAGES.euroPrice, IMAGES.euroCards],
  "doi-song": [IMAGES.train, IMAGES.hospitalCare, IMAGES.schoolClassroom, IMAGES.berlinTower, IMAGES.berlinWinter],
  "nguoi-viet": [IMAGES.community, IMAGES.community2, IMAGES.work, IMAGES.signing],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Pick an illustrative image (royalty-free fallback pool) — never the outlet's own photo. */
export function pickImage(category: string, seed: string): Img {
  const pool = POOLS[(isCategory(category) ? category : "thoi-su") as CategorySlug];
  return pool[hash(seed) % pool.length];
}
