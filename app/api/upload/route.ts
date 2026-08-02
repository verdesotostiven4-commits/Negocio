import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob todavía no está conectado." }, { status: 503 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safePath = pathname.replace(/[^a-zA-Z0-9._/-]+/g, "-");
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "audio/mpeg",
            "audio/mp4",
            "audio/wav",
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          maximumSizeInBytes: 1024 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ safePath })
        };
      },
      onUploadCompleted: async () => {
        // The admin adds the returned public URL to the playlist after upload.
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falló la carga." }, { status: 400 });
  }
}
