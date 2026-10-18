import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { welcomeEmailHtml } from "@/lib/email-templates";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ sent: false }, { status: 401 });
    }

    const { error } = await resend.emails.send({
      from: "PayGuard <onboarding@resend.dev>",
      to: user.email,
      subject: "Witaj w PayGuard! 🛡️",
      html: welcomeEmailHtml(),
    });

    if (error) {
      console.error("Błąd wysyłki e-maila powitalnego:", error);
      // Celowo nie blokujemy rejestracji: e-mail to funkcja poboczna.
      return NextResponse.json({ sent: false });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Błąd /api/send-welcome-email:", err);
    return NextResponse.json({ sent: false });
  }
}