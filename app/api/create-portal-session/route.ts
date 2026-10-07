import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { billingPortalSchema } from "@/lib/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = billingPortalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane.", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { userId } = result.data;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Brak klienta Stripe — najpierw przejdź na plan Pro." },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get("origin")}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Błąd tworzenia sesji Customer Portal:", err);
    return NextResponse.json(
      { error: "Nie udało się otworzyć portalu rozliczeniowego." },
      { status: 500 }
    );
  }
}