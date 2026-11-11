import { BRAND } from "@/lib/brand";

export function Logo({ size = "lg", light = false }: { size?: "sm" | "lg"; light?: boolean }) {
  const big = size === "lg";
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span
        className={`font-serif font-bold tracking-[-0.03em] ${light ? "text-paper" : "text-ink"} ${big ? "text-[40px] md:text-[58px]" : "text-[24px]"}`}
      >
        {BRAND.first}
        <span className="text-accent">·</span>
        {BRAND.second}
      </span>
      <span className={`mt-1 flex w-full overflow-hidden ${big ? "h-[4px] max-w-[120px]" : "h-[2px] max-w-[60px]"}`}>
        <span className={`flex-1 ${light ? "bg-white" : "bg-ink"}`} />
        <span className="flex-1 bg-accent" />
        <span className="flex-1 bg-gold" />
      </span>
    </span>
  );
}
