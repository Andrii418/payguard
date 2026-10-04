"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/lib/use-subscriptions";

export function AiAdvisorCard({ subscriptions }: { subscriptions: Subscription[] }) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak.");
      } else {
        setAdvice(data.advice);
      }
    } catch {
      setError("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Doradca Finansowy AI
          </h2>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={loading || subscriptions.length === 0}
          className="gap-2 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizuję...
            </>
          ) : (
            "Analizuj wydatki"
          )}
        </Button>
      </div>

      {subscriptions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Dodaj co najmniej jedną subskrypcję, żeby AI mogło ją przeanalizować.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {advice && (
        <div className="whitespace-pre-line rounded-lg border border-emerald-500/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-foreground">
          {advice}
        </div>
      )}
    </div>
  );
}
