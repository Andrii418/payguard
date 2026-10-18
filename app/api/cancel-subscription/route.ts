import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji." }, { status: 400 });
    }

    // Anulowanie wywoła webhook "customer.subscription.deleted", który zaktualizuje status w bazie.
    await stripe.subscriptions.cancel(profile.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Błąd anulowania subskrypcji:", err);
    return NextResponse.json({ error: "Nie udało się anulować subskrypcji." }, { status: 500 });
  }
}