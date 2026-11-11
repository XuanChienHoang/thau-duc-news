import type { CategorySlug } from "./categories";

/** Short, original background paragraphs written by the editorial team, used to frame auto-briefs. */
export const CATEGORY_CONTEXT: Record<CategorySlug, string> = {
  "thoi-su":
    "Nhịp Đức theo dõi liên tục các diễn biến trong nước. Với những sự kiện còn đang tiếp diễn, thông tin có thể thay đổi nhanh – bạn đọc nên kiểm tra lại với nguồn chính thức trước khi đưa ra quyết định quan trọng.",
  "chinh-tri":
    "Nước Đức vận hành theo mô hình liên bang: Quốc hội (Bundestag) thông qua luật, Thượng viện (Bundesrat) đại diện 16 bang có quyền phủ quyết nhiều đạo luật, còn chính phủ do Thủ tướng đứng đầu. Một tuyên bố chính trị chưa phải là luật – phải qua nhiều bước mới có hiệu lực.",
  "di-tru":
    "Mọi thay đổi về cư trú, visa hay quốc tịch chỉ có hiệu lực khi luật được thông qua và công bố chính thức. Trong lúc chờ đợi, hồ sơ của bạn vẫn được xét theo quy định hiện hành. Nếu không chắc chắn, hãy hỏi Sở Ngoại kiều (Ausländerbehörde) nơi cư trú hoặc một văn phòng tư vấn di trú uy tín.",
  "luat-moi":
    "Ở Đức, một đạo luật thường đi qua dự thảo của bộ, nội các, Quốc hội và Thượng viện trước khi được Tổng thống ký và đăng Công báo Liên bang (Bundesgesetzblatt). Ngày có hiệu lực thường được ghi rõ trong văn bản – đó mới là mốc bạn cần quan tâm.",
  "kinh-te":
    "Những biến động kinh tế ở Đức tác động trực tiếp tới túi tiền của người lao động và các hộ kinh doanh nhỏ – từ nhà hàng, tiệm nail tới cửa hàng tạp hóa. Lương tối thiểu, thuế, giá năng lượng và tiền thuê nhà là những yếu tố cần theo dõi sát.",
  "doi-song":
    "Từ tàu xe, bảo hiểm y tế tới trường học của con cái, các quy định đời sống ở Đức thay đổi khá thường xuyên. Theo dõi sớm giúp gia đình bạn chủ động hơn và tránh những khoản phí phát sinh không đáng có.",
  "nguoi-viet":
    "Cộng đồng gốc Việt ở Đức ước tính hơn 200.000 người, gồm nhiều thế hệ: người sang từ thời thuyền nhân, lao động hợp tác ở Đông Đức cũ, và lớp trẻ du học, học nghề, điều dưỡng ngày nay. Mỗi thay đổi chính sách đều có thể chạm tới một nhóm trong cộng đồng.",
};

type Tip = { re: RegExp; text: string };

export const VN_TIPS: Tip[] = [
  { re: /einbürger|staatsangehörig|staatsbürger/i, text: "Người Việt đang chuẩn bị nhập quốc tịch Đức nên kiểm tra lại điều kiện về thời gian cư trú, trình độ tiếng Đức và khả năng tự trang trải tài chính theo quy định mới nhất." },
  { re: /aufenthalt|visum|visa\b|niederlassung|blaue karte|chancenkarte|fachkräfte/i, text: "Nếu thẻ cư trú của bạn sắp hết hạn, hãy đặt hẹn gia hạn sớm – nhiều Sở Ngoại kiều đang quá tải và thời gian chờ có thể kéo dài nhiều tháng." },
  { re: /familiennachzug/i, text: "Gia đình đang làm hồ sơ đoàn tụ nên theo dõi sát thông báo của Đại sứ quán Đức tại Hà Nội và chuẩn bị đủ giấy tờ trước khi đặt lịch hẹn." },
  { re: /abschieb|duldung|zurückweis/i, text: "Người đang ở diện tạm hoãn trục xuất (Duldung) nên tìm tư vấn pháp lý sớm; một số tổ chức hỗ trợ người nhập cư có tư vấn miễn phí." },
  { re: /mindestlohn|minijob|lohn/i, text: "Chủ nhà hàng, tiệm nail và người lao động cần rà soát lại hợp đồng, bảng chấm công: trả dưới mức lương tối thiểu có thể bị phạt rất nặng." },
  { re: /bürgergeld|grundsicherung|jobcenter/i, text: "Gia đình đang nhận trợ cấp từ Jobcenter nên đọc kỹ các thư thông báo và giữ đúng lịch hẹn, vì quy định về cắt giảm trợ cấp đang có xu hướng chặt hơn." },
  { re: /steuer|kasse|e-rechnung|finanzamt/i, text: "Hộ kinh doanh nên trao đổi với cố vấn thuế (Steuerberater) để cập nhật nghĩa vụ kê khai, máy tính tiền và hóa đơn điện tử." },
  { re: /miete|wohnung|mieter/i, text: "Người thuê nhà nên kiểm tra kỹ các đợt tăng giá thuê và phí dịch vụ (Nebenkosten); trong nhiều trường hợp, mức tăng bị luật giới hạn." },
  { re: /krankenkasse|krankenversicherung|pflege|gesundheit/i, text: "Hãy kiểm tra thư từ quỹ bảo hiểm y tế của bạn: mức phí bổ sung (Zusatzbeitrag) thay đổi và bạn có quyền chuyển sang quỹ khác." },
  { re: /deutschlandticket|bahn|streik/i, text: "Người đi làm, đi học bằng tàu xe nên theo dõi lịch đình công và giá vé tháng để chủ động sắp xếp lịch trình." },
  { re: /kindergeld|elterngeld|kita|schule/i, text: "Phụ huynh nên kiểm tra quyền lợi về tiền con (Kindergeld), tiền nuôi con nhỏ (Elterngeld) và hạn đăng ký nhà trẻ tại địa phương." },
  { re: /vietnam|vietnames/i, text: "Đây là tin liên quan trực tiếp tới Việt Nam hoặc người Việt – Nhịp Đức sẽ tiếp tục theo dõi và cập nhật." },
];

export function tipsFor(text: string): string[] {
  return VN_TIPS.filter((t) => t.re.test(text))
    .map((t) => t.text)
    .slice(0, 2);
}
