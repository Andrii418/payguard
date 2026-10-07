import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkoutSchema } from "@/lib/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane.", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { userId, email } = result.data;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      customer_email: email,
      metadata: { supabase_user_id: userId },
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Błąd tworzenia sesji Stripe:", err);
    return NextResponse.json({ error: "Nie udało się utworzyć sesji płatności." }, { status: 500 });
  }
}