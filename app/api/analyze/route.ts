import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { analyzeSchema } from "@/lib/schemas";
import { getAuthenticatedUser } from "@/lib/server-auth";

const MAX_SUBSCRIPTIONS = 100;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const body = await req.json();
    const result = analyzeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane wejściowe.", issues: result.error.issues },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Brak klucza GEMINI_API_KEY na serwerze." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Ograniczamy rozmiar promptu, żeby nikt nie zużył nam limitu Gemini ogromnym zapytaniem.
    const subscriptions = result.data.subscriptions.slice(0, MAX_SUBSCRIPTIONS);

    const summary = subscriptions
      .map(
        (s) =>
          `- ${s.name.slice(0, 80)}: ${s.price} zł / ${
            s.billing_cycle === "monthly" ? "miesiąc" : "rok"
          }, kategoria: ${s.category.slice(0, 30)}`
      )
      .join("\n");

    const prompt = `Jesteś doradcą finansowym analizującym subskrypcje użytkownika. Oto lista jego aktywnych subskrypcji:

${summary}

Przeanalizuj tę listę i w punktach, po polsku (maks. 150 słów):
1. Wskaż ewentualne duplikaty lub nakładające się usługi (np. dwie platformy streamingowe).
2. Zaproponuj konkretne, praktyczne sposoby oszczędzania.
3. Podaj przybliżoną sumę możliwych oszczędności miesięcznie w złotych.`;

    // Retry z rosnącym opóźnieniem: darmowy tier Gemini bywa chwilowo przeciążony (błąd 503).
    async function generateWithRetry(attempt = 1): Promise<string> {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        return response.text ?? "";
      } catch (err: unknown) {
        const overloaded = err instanceof Error && err.message.includes("UNAVAILABLE");

        if (overloaded && attempt < 3) {
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
      { error: "Nie udało się połączyć z Gemini AI. Spróbuj za chwilę." },
      { status: 500 }
    );
  }
}