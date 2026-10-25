import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { weeklyDigestEmailHtml } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { addDays, monthKey, monthLabel, toISODate } from "@/lib/dates";
import { getExpenseCategoryMeta } from "@/lib/expense-categories";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const today = new Date();
  const weekStart = toISODate(addDays(-6, today)); // ostatnie 7 dni razem z dzisiejszym
  const monthStart = `${monthKey(today)}-01`;
  const from = weekStart < monthStart ? weekStart : monthStart;

  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (usersError) {
    console.error("Błąd pobierania użytkowników:", usersError);
    return NextResponse.json({ error: "Błąd pobierania użytkowników." }, { status: 500 });
  }

  let sentCount = 0;

  for (const user of usersData.users) {
    if (!user.email) continue;

    const { data: expenses } = await supabaseAdmin
      .from("expenses")
      .select("amount, category, spent_on")
      .eq("user_id", user.id)
      .gte("spent_on", from);

    const rows = (expenses ?? []).map((e) => ({
      amount: Number(e.amount),
      category: String(e.category),
      spentOn: String(e.spent_on),
    }));

    // Bez żadnych wydatków w ostatnich dniach nie ma o czym pisać
    if (rows.length === 0) continue;

    const weekRows = rows.filter((r) => r.spentOn >= weekStart);
    const monthRows = rows.filter((r) => r.spentOn >= monthStart);

    const byCategory = new Map<string, number>();
    for (const r of weekRows) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + r.amount);
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

    const { error: sendError } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: user.email,
      subject: "Twój tydzień w liczbach — PayGuard",
      html: weeklyDigestEmailHtml({
        weekTotal: weekRows.reduce((sum, r) => sum + r.amount, 0),
        monthTotal: monthRows.reduce((sum, r) => sum + r.amount, 0),
        monthName: monthLabel(monthKey(today)),
        topCategory: top ? getExpenseCategoryMeta(top[0]).label : null,
        topCategoryAmount: top ? top[1] : 0,
      }),
    });

    if (sendError) {
      console.error("Nie udało się wysłać podsumowania tygodniowego:", sendError);
    } else {
      sentCount += 1;
    }
  }

  return NextResponse.json({ usersChecked: usersData.users.length, sent: sentCount });
}