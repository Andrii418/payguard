import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { analyzeSchema } from "@/lib/schemas";
import { getAuthenticatedUser } from "@/lib/server-auth";

const MAX_SUBSCRIPTIONS = 100;
const MODEL = "gemini-3.8-flash";
const MAX_ATTEMPTS = 4; // pierwsza próba + 3 ponowienia
const BASE_DELAY_MS = 1500; // opóźnienia: 1,5 s, 3 s, 6 s (łącznie ok. 10 s)

// Jawny limit czasu funkcji (60 s mieści się w limitach darmowego planu Vercela)
export const maxDuration = 60;

interface GeminiErrorInfo {
  status: number | null;
  message: string;
}

// Błędy z SDK Gemini mają różny kształt, więc odczytujemy status i treść ostrożnie.
function readError(err: unknown): GeminiErrorInfo {
  const e = err as { status?: number; error?: { code?: number }; message?: string } | null;
  const status =
    typeof e?.status === "number" ? e.status : typeof e?.error?.code === "number" ? e.error.code : null;
  const message = e?.message ?? String(err);
  return { status, message };
}

function isOverloaded({ status, message }: GeminiErrorInfo) {
  return status === 503 || message.includes("UNAVAILABLE") || message.includes("high demand");
}

async function generateWithRetry(ai: GoogleGenAI, prompt: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
      return response.text ?? "";
    } catch (err) {
      lastError = err;

      // Ponawiamy tylko przy przeciążeniu. Zły klucz czy model nic nie zmieni.
      if (!isOverloaded(readError(err)) || attempt === MAX_ATTEMPTS) break;

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`Gemini przeciążony (próba ${attempt}/${MAX_ATTEMPTS}). Ponawiam za ${delay} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Każdy rodzaj błędu dostaje własny, zrozumiały komunikat (pełna treść trafia do logów).
function errorResponse(err: unknown) {
  const info = readError(err);
  const { status, message } = info;

  if (isOverloaded(info)) {
    return NextResponse.json(
      { error: "Gemini jest chwilowo przeciążone. Spróbuj ponownie za minutę." },
      { status: 503 }
    );
  }

  if (status === 429 || message.includes("RESOURCE_EXHAUSTED")) {
    return NextResponse.json(
      { error: "Przekroczono limit darmowego Gemini API. Spróbuj później." },
      { status: 429 }
    );
  }

  if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || status === 401 || status === 403) {
    return NextResponse.json(
      { error: "Klucz Gemini API jest nieprawidłowy lub nie ma uprawnień. Sprawdź GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  if (status === 404 || message.includes("NOT_FOUND")) {
    return NextResponse.json(
      { error: "Model Gemini jest niedostępny. Google mógł zmienić jego nazwę." },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "Nie udało się połączyć z Gemini AI. Spróbuj za chwilę." }, { status: 500 });
}

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

    const advice = await generateWithRetry(ai, prompt);
    return NextResponse.json({ advice });
  } catch (err) {
    console.error("Błąd Gemini API:", err);
    return errorResponse(err);
  }
}