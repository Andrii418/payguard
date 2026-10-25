import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { renewalReminderEmailHtml } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { addDays, toISODate } from "@/lib/dates";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const targetDate = toISODate(addDays(3));

  const { data: payments, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, name, price, billing_cycle, kind, next_renewal")
    .eq("next_renewal", targetDate);

  if (error) {
    console.error("Błąd pobierania płatności do przypomnień:", error);
    return NextResponse.json({ error: "Błąd bazy danych." }, { status: 500 });
  }

  let sentCount = 0;

  for (const payment of payments ?? []) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(payment.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const { error: sendError } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: email,
      subject: `Przypomnienie: ${payment.name} za 3 dni`,
      html: renewalReminderEmailHtml({
        name: payment.name,
        price: Number(payment.price),
        billingCycle: payment.billing_cycle,
        kind: payment.kind === "fixed" ? "fixed" : "subscription",
      }),
    });

    if (sendError) {
      console.error(`Nie udało się wysłać przypomnienia (${payment.name}):`, sendError);
    } else {
      sentCount += 1;
    }
  }

  return NextResponse.json({ checked: payments?.length ?? 0, sent: sentCount });
}