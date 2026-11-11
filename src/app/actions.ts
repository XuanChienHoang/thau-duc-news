"use server";

import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { ensureSchema } from "@/lib/ensure-schema";

export type SubscribeState = { ok: boolean; message: string } | null;

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: "Email chưa đúng định dạng." };
  await ensureSchema();
  const rows = await db.insert(subscribers).values({ email }).onConflictDoNothing().returning({ id: subscribers.id });
  return rows.length
    ? { ok: true, message: "Cảm ơn bạn! Bản tin sáng sẽ đến hộp thư của bạn từ ngày mai." }
    : { ok: true, message: "Email này đã đăng ký rồi – hẹn gặp bạn trong bản tin sáng." };
}
