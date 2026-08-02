import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    adminPinConfigured: Boolean(process.env.ADMIN_PIN),
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
    timestamp: new Date().toISOString()
  });
}
