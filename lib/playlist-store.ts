import { head, put } from "@vercel/blob";
import { DEFAULT_PLAYLIST } from "@/lib/default-playlist";
import type { SignagePlaylist } from "@/lib/types";

const PLAYLIST_PATH = "barrio-max-tv/config/playlist.json";

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readPlaylist(): Promise<{ playlist: SignagePlaylist; source: "blob" | "default" }> {
  if (!hasBlob()) return { playlist: DEFAULT_PLAYLIST, source: "default" };

  try {
    const metadata = await head(PLAYLIST_PATH);
    const response = await fetch(metadata.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Playlist HTTP ${response.status}`);
    const playlist = (await response.json()) as SignagePlaylist;
    return { playlist, source: "blob" };
  } catch {
    return { playlist: DEFAULT_PLAYLIST, source: "default" };
  }
}

export async function writePlaylist(playlist: SignagePlaylist): Promise<SignagePlaylist> {
  if (!hasBlob()) {
    throw new Error("Vercel Blob todavía no está conectado al proyecto.");
  }

  const normalized: SignagePlaylist = {
    ...playlist,
    version: Math.max(1, Number(playlist.version || 1) + 1),
    updatedAt: new Date().toISOString()
  };

  await put(PLAYLIST_PATH, JSON.stringify(normalized, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });

  return normalized;
}
