import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { renewalReminderEmailHtml } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const targetDate = inThreeDays.toISOString().slice(0, 10);

  const { data: subscriptions, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, name, price, billing_cycle, next_renewal")
    .eq("next_renewal", targetDate);

  if (error) {
    console.error("Błąd pobierania subskrypcji do przypomnień:", error);
    return NextResponse.json({ error: "Błąd bazy danych." }, { status: 500 });
  }

  let sentCount = 0;

  for (const sub of subscriptions ?? []) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const { error: sendError } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: email,
      subject: `Przypomnienie: ${sub.name} odnawia się za 3 dni`,
      html: renewalReminderEmailHtml({
        subscriptionName: sub.name,
        price: sub.price,
        billingCycle: sub.billing_cycle,
      }),
    });

    if (!sendError) sentCount += 1;
  }

  return NextResponse.json({ checked: subscriptions?.length ?? 0, sent: sentCount });
}