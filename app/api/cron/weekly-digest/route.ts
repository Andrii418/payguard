import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { weeklyDigestEmailHtml } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error("Błąd pobierania użytkowników:", usersError);
    return NextResponse.json({ error: "Błąd pobierania użytkowników." }, { status: 500 });
  }

  let sentCount = 0;

  for (const user of usersData.users) {
    if (!user.email) continue;

    const { data: subscriptions } = await supabaseAdmin
      .from("subscriptions")
      .select("price, billing_cycle")
      .eq("user_id", user.id);

    if (!subscriptions || subscriptions.length === 0) continue;

    const monthlyCost = subscriptions.reduce(
      (sum, s) => sum + (s.billing_cycle === "monthly" ? s.price : s.price / 12),
      0
    );

    const { error: sendError } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: user.email,
      subject: "Twoje tygodniowe podsumowanie wydatków — PayGuard",
      html: weeklyDigestEmailHtml({ monthlyCost, subscriptionCount: subscriptions.length }),
    });

    if (!sendError) sentCount += 1;
  }

  return NextResponse.json({ usersChecked: usersData.users.length, sent: sentCount });
}