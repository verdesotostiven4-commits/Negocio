import { NextResponse } from "next/server";
import { adminCookie, makeSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { pin?: string };
  const expectedPin = process.env.ADMIN_PIN;

  if (!expectedPin || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Falta configurar ADMIN_PIN o AUTH_SECRET en Vercel." }, { status: 503 });
  }

  if (!body.pin || body.pin !== expectedPin) {
    return NextResponse.json({ error: "PIN incorrecto." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie(makeSessionToken()));
  return response;
}
