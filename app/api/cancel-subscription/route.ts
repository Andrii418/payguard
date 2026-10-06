import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cancelSubscriptionSchema } from "@/lib/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = cancelSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane.", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { userId } = result.data;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji." }, { status: 400 });
    }

    await stripe.subscriptions.cancel(profile.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Błąd anulowania subskrypcji:", err);
    return NextResponse.json({ error: "Nie udało się anulować subskrypcji." }, { status: 500 });
  }
}