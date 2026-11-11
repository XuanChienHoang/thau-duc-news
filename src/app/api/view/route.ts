import { incrementViews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (typeof slug === "string" && slug.length < 200) await incrementViews(slug);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
