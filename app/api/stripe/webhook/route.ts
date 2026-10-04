import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  // WAŻNE: musimy odczytać surowe (nieprzetworzone) body, inaczej
  // weryfikacja podpisu Stripe się nie powiedzie.
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Nieprawidłowy podpis webhooka Stripe:", err);
    return NextResponse.json({ error: "Nieprawidłowy podpis." }, { status: 400 });
  }

  switch (event.type) {
    // Użytkownik pomyślnie opłacił subskrypcję
        case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;

      console.log("Webhook checkout.session.completed, userId z metadata:", userId);

      if (!userId) {
        console.error("BRAK supabase_user_id w metadata sesji!", session.metadata);
        break;
      }

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "pro",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Błąd zapisu do Supabase (profiles):", error);
      } else {
        console.log("Profil zaktualizowany na PRO dla:", userId);
      }
      break;
    }

    // Subskrypcja została anulowana (np. przez nasz endpoint /api/cancel-subscription)
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "free", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}