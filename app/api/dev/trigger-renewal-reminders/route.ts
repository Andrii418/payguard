import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Endpoint służy tylko do lokalnych testów - na produkcji (Vercel) udaje, że nie istnieje.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = await fetch(`${req.nextUrl.origin}/api/cron/renewal-reminders`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}