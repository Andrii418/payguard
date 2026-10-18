"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/lib/use-subscriptions";
import { activeCategories } from "@/lib/analytics";
import { authedFetch } from "@/lib/api-client";

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function Advice({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
      {lines.map((line, i) => {
        const bullet = line.match(/^[*-]\s+(.*)$/);
        const numbered = line.match(/^(\d+)\.\s+(.*)$/);

        if (bullet) {
          return (
            <p key={i} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span><Inline text={bullet[1]} /></span>
            </p>
          );
        }
        if (numbered) {
          return (
            <p key={i} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 font-mono text-[11px] text-emerald-300">
                {numbered[1]}
              </span>
              <span><Inline text={numbered[2]} /></span>
            </p>
          );
        }
        return (
          <p key={i}><Inline text={line} /></p>
        );
      })}
    </div>
  );
}

export function AiAdvisorCard({ subscriptions }: { subscriptions: Subscription[] }) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const res = await authedFetch("/api/analyze", {
        method: "POST",
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
      toast.error("Nie udało się połączyć z Doradcą AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card relative h-full overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/30 to-emerald-500/30 text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Doradca Finansowy AI</h2>
            <p className="text-xs text-muted-foreground">Napędzany przez Google Gemini</p>
          </div>
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

      <div className="relative">
        {subscriptions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Dodaj co najmniej jedną subskrypcję, żeby AI mogło ją przeanalizować.
          </p>
        )}

        {subscriptions.length > 0 && !advice && !loading && !error && (
          <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-muted-foreground">
            Gemini przeanalizuje{" "}
            <span className="font-mono text-foreground">{subscriptions.length}</span> subskrypcji w{" "}
            <span className="font-mono text-foreground">{activeCategories(subscriptions).length}</span> kategoriach,
            wskaże nakładające się usługi i oszacuje, ile możesz zaoszczędzić.
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[92, 78, 85, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-white/[0.06]"
                style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {advice && (
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
            <Advice text={advice} />
          </div>
        )}
      </div>
    </div>
  );
}