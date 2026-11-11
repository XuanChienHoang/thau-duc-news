"use client";

import { useActionState, useEffect, useState } from "react";
import { subscribe, type SubscribeState } from "@/app/actions";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  return (
    <form action={action} className="w-full">
      <div className={`flex overflow-hidden rounded-full border ${dark ? "border-white/25 bg-white/5" : "border-ink bg-white"}`}>
        <input
          name="email"
          type="email"
          required
          placeholder="email@cua-ban.de"
          className={`min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[15px] outline-none ${dark ? "text-white placeholder:text-white/40" : "placeholder:text-muted/60"}`}
        />
        <button disabled={pending} className="bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60">
          {pending ? "Đang gửi…" : "Đăng ký"}
        </button>
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? (dark ? "text-emerald-300" : "text-emerald-700") : "text-[#ff8a9a]"}`}>{state.message}</p>}
    </form>
  );
}

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${p}%` }} />
    </div>
  );
}

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `v:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => {});
  }, [slug]);
  return null;
}

export function ArticleAudioPlayer({ title, sapo, body }: { title: string; sapo: string; body: string }) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanBody = body
      .replace(/\|[^\n]+\|/g, " ")
      .replace(/^#{1,3}\s+/gm, "")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ");
    const utterance = new SpeechSynthesisUtterance(`${title}. ${sapo}. ${cleanBody}`);
    utterance.lang = "vi-VN";
    utterance.rate = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.toLowerCase().includes("vi"));
    if (viVoice) utterance.voice = viVoice;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition ${
        playing ? "border-accent bg-accent text-white" : "border-rule bg-paper-2/70 text-ink hover:border-ink"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        {playing ? <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" /> : <path d="M8 5v14l11-7L8 5Z" />}
      </svg>
      {playing ? "Dừng nghe" : "Nghe bài báo"}
    </button>
  );
}

export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fallthrough */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const fb = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,width=600,height=500",
    );
  const btn = "flex h-9 items-center gap-2 rounded-full border border-rule px-3.5 text-[13px] font-semibold transition hover:border-ink";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={fb} className={btn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z" />
        </svg>
        Facebook
      </button>
      <button onClick={share} className={btn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
          <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </svg>
        {copied ? "Đã sao chép!" : "Chia sẻ"}
      </button>
    </div>
  );
}
