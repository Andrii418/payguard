"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscription {
  name: string;
  price: number;
  billing_cycle: string;
  category: string;
}

export function AiAdvisorCard({ refreshKey }: { refreshKey: number }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("subscriptions")
      .select("name, price, billing_cycle, category")
      .then(({ data }) => setSubscriptions(data ?? []));
  }, [refreshKey]);

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
          className="gap-2 bg-emerald-500 hover:bg-emerald-500/90"
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
        <p className="text-sm text-muted">
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