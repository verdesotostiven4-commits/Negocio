import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { readPlaylist, writePlaylist } from "@/lib/playlist-store";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["video", "image", "slide"]),
  title: z.string(),
  subtitle: z.string().optional(),
  eyebrow: z.string().optional(),
  badge: z.string().optional(),
  price: z.string().optional(),
  callToAction: z.string().optional(),
  src: z.string().optional(),
  poster: z.string().optional(),
  voiceoverUrl: z.string().optional(),
  durationSeconds: z.number().min(2).max(3600),
  transition: z.enum(["fade", "slide", "zoom", "wipe", "none"]),
  theme: z.enum(["brand", "offer", "services", "fresh", "dark"]).optional(),
  enabled: z.boolean(),
  muted: z.boolean().optional(),
  fit: z.enum(["cover", "contain"]).optional(),
  schedule: z.object({
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    days: z.array(z.number().int().min(0).max(6)).optional(),
    fromHour: z.string().optional(),
    toHour: z.string().optional()
  }).optional()
});

const playlistSchema = z.object({
  version: z.number(),
  updatedAt: z.string(),
  settings: z.object({
    businessName: z.string().min(1),
    slogan: z.string(),
    location: z.string(),
    phone: z.string(),
    hours: z.string(),
    backgroundMusicUrl: z.string().optional(),
    backgroundMusicVolume: z.number().min(0).max(1),
    autoRefreshSeconds: z.number().min(10).max(3600),
    showClock: z.boolean(),
    showProgress: z.boolean()
  }),
  items: z.array(itemSchema).max(250)
});

export async function GET() {
  const data = await readPlaylist();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = playlistSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Playlist inválida.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const playlist = await writePlaylist(parsed.data);
    return NextResponse.json({ playlist });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar." }, { status: 500 });
  }
}
