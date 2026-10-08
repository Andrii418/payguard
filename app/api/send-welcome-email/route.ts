import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { welcomeEmailHtml } from "@/lib/email-templates";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Nieprawidłowy e-mail." }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: result.data.email,
      subject: "Witaj w PayGuard! 🛡️",
      html: welcomeEmailHtml(),
    });

    if (error) {
      console.error("Błąd wysyłki e-maila powitalnego:", error);
      // Celowo NIE blokujemy rejestracji, jeśli e-mail się nie wyśle -
      // to funkcja poboczna, użytkownik i tak ma już konto.
      return NextResponse.json({ sent: false });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Błąd /api/send-welcome-email:", err);
    return NextResponse.json({ sent: false });
  }
}