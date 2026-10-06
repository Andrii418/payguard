import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { analyzeSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = analyzeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane wejściowe.", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { subscriptions } = result.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Brak klucza GEMINI_API_KEY w .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // ... reszta funkcji (subscriptionsSummary, prompt, generateWithRetry) BEZ ZMIAN

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

        // Prosty retry z rosnącym opóźnieniem - Gemini (darmowy tier) bywa
    // chwilowo przeciążone (błąd 503), więc próbujemy do 3 razy.
    async function generateWithRetry(attempt = 1): Promise<string> {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        return response.text ?? "";
      } catch (err: unknown) {
        const isOverloaded =
          err instanceof Error && err.message.includes("UNAVAILABLE");

        if (isOverloaded && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          return generateWithRetry(attempt + 1);
        }
        throw err;
      }
    }

    const advice = await generateWithRetry();

    return NextResponse.json({ advice });
  } catch (err) {
    console.error("Błąd Gemini API:", err);
    return NextResponse.json(
      { error: "Nie udało się połączyć z Gemini AI. Sprawdź klucz API." },
      { status: 500 }
    );
  }
}