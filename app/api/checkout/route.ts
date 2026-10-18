import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthenticatedUser } from "@/lib/server-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    if (user.is_anonymous || !user.email) {
      return NextResponse.json(
        { error: "W trybie demo płatności są wyłączone. Załóż konto." },
        { status: 403 }
      );
    }

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      customer_email: user.email,
      // Webhook użyje tego, żeby wiedzieć, któremu użytkownikowi przypisać plan Pro.
      metadata: { supabase_user_id: user.id },
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/settings?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Błąd tworzenia sesji Stripe:", err);
    return NextResponse.json({ error: "Nie udało się utworzyć sesji płatności." }, { status: 500 });
  }
}