import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.rpc("post_due_recurring", { p_user: null });

  if (error) {
    console.error("Błąd księgowania płatności cyklicznych:", error);
    return NextResponse.json({ error: "Błąd bazy danych." }, { status: 500 });
  }

  return NextResponse.json({ posted: data ?? 0 });
}