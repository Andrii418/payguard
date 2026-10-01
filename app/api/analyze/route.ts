import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface SubscriptionInput {
  name: string;
  price: number;
  billing_cycle: string;
  category: string;
}

export async function POST(req: NextRequest) {
  try {
    const { subscriptions } = (await req.json()) as { subscriptions: SubscriptionInput[] };

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Brak klucza GEMINI_API_KEY w .env.local" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "Brak subskrypcji do przeanalizowania." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const subscriptionsSummary = subscriptions
      .map(
        (s) =>
          `- ${s.name}: ${s.price} zł / ${s.billing_cycle === "monthly" ? "miesiąc" : "rok"}, kategoria: ${s.category}`
      )
      .join("\n");

    const prompt = `Jesteś doradcą finansowym analizującym subskrypcje użytkownika. Oto lista jego aktywnych subskrypcji:

${subscriptionsSummary}

Przeanalizuj tę listę i w punktach, po polsku (maks. 150 słów):
1. Wskaż ewentualne duplikaty lub nakładające się usługi (np. dwie platformy streamingowe).
2. Zaproponuj konkretne, praktyczne sposoby oszczędzania.
3. Podaj przybliżoną sumę możliwych oszczędności miesięcznie w złotych.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ advice: response.text });
  } catch (err) {
    console.error("Błąd Gemini API:", err);
    return NextResponse.json(
      { error: "Nie udało się połączyć z Gemini AI. Sprawdź klucz API." },
      { status: 500 }
    );
  }
}