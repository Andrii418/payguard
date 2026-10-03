import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Brak danych użytkownika." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      customer_email: email,
      // Dzięki temu webhook będzie wiedział, KTÓREMU użytkownikowi Supabase
      // przypisać opłaconą subskrypcję.
      metadata: { supabase_user_id: userId },
      success_url: `${req.headers.get("origin")}/?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Błąd tworzenia sesji Stripe:", err);
    return NextResponse.json({ error: "Nie udało się utworzyć sesji płatności." }, { status: 500 });
  }
}