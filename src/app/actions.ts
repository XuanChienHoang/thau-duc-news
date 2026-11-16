"use server";

import { revalidatePath } from "next/cache";
import { addSubscriber } from "@/lib/storage";

export type SubscribeState = { ok: boolean; message: string } | null;

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, message: "Email chưa đúng định dạng." };
  }

  const status = addSubscriber(email);
  if (status === "added") {
    revalidatePath("/");
    return { ok: true, message: "Cảm ơn bạn! Bản tin sáng sẽ đến hộp thư của bạn từ ngày mai." };
  }
  if (status === "exists") {
    return { ok: true, message: "Email này đã đăng ký rồi – hẹn gặp bạn trong bản tin sáng." };
  }
  return {
    ok: true,
    message: "Hệ thống đã ghi nhận yêu cầu của bạn. Bản tin mới được cập nhật tự động 3 lần mỗi ngày trên trang chủ.",
  };
}
