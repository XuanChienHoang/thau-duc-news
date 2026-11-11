"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCategory, type CategorySlug } from "@/lib/categories";
import { ingestCustomUrl, runIngest, upgradeArticleWithAI } from "@/lib/ingest";
import { getFeedQueue, saveFeedQueue } from "@/lib/storage";

function authorized(formData: FormData) {
  const token = process.env.ADMIN_TOKEN;
  return !token || formData.get("token") === token;
}

export async function runIngestAction(formData: FormData) {
  if (!authorized(formData)) return;
  await runIngest();
  revalidatePath("/quan-tri");
  revalidatePath("/");
}

export async function prioritizeAction(formData: FormData) {
  if (!authorized(formData)) return;
  const id = Number(formData.get("id"));
  if (!id) return;

  const queue = getFeedQueue();
  const item = queue.find((q) => q.id === id);
  if (item) {
    item.status = "new";
    item.relevance = 99;
    item.publishedAt = new Date().toISOString();
    saveFeedQueue(queue);
  }

  revalidatePath("/quan-tri");
}

export async function upgradeArticleAction(formData: FormData) {
  if (!authorized(formData)) return;
  const id = Number(formData.get("id"));
  if (!id) return;
  await upgradeArticleWithAI(id);
  revalidatePath("/quan-tri");
  revalidatePath("/");
}

export async function ingestCustomUrlAction(formData: FormData) {
  if (!authorized(formData)) return;
  const url = String(formData.get("url") ?? "").trim();
  const catRaw = String(formData.get("category") ?? "thoi-su").trim();
  const cat: CategorySlug = isCategory(catRaw) ? catRaw : "thoi-su";
  if (!url) return;
  const slug = await ingestCustomUrl(url, cat);
  revalidatePath("/quan-tri");
  revalidatePath("/");
  if (slug) {
    redirect(`/bai-viet/${slug}`);
  }
}
