import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

const MAX_AGE_DAYS = 7;
const PER_PAGE = 200;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  // Przechodzimy po stronach użytkowników. Usunięcia przesuwają paginację,
  // więc pominięte w tym przebiegu konta zniknie następny przebieg.
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (error) {
      console.error("Błąd pobierania użytkowników do sprzątania:", error);
      return NextResponse.json({ error: "Błąd pobierania użytkowników." }, { status: 500 });
    }

    for (const user of data.users) {
      const isOldDemoUser = user.is_anonymous && new Date(user.created_at).getTime() < cutoff;
      if (!isOldDemoUser) continue;

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (!deleteError) deleted += 1;
    }

    if (data.users.length < PER_PAGE) break;
  }

  return NextResponse.json({ deleted });
}