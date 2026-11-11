import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { runIngest } from "../src/lib/ingest";

async function main() {
  console.log("=== BẮT ĐẦU QUY TRÌNH TỰ ĐỘNG CÀO BÁO ĐỨC & BIÊN TẬP TIN ===");
  console.log(`Thời gian: ${new Date().toISOString()}`);
  
  try {
    const result = await runIngest();
    console.log(`\n✅ Hoàn tất lượt cào tin:`);
    console.log(`- Đã nạp vào hàng đợi: ${result.fetched} tin.`);
    console.log(`- Đã xuất bản thành công: ${result.created} bài viết chuyên sâu.`);
    console.log("\n--- Chi tiết nhật ký ---");
    console.log(result.log.join("\n"));
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi trong quá trình chạy cron ingest:", err);
    process.exit(1);
  }
}

main();

