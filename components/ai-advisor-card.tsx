"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, RefreshCw, Sparkles, Target } from "lucide-react";
import { authedFetch } from "@/lib/api-client";
import { formatPLN } from "@/lib/analytics";
import type { BudgetAdvice, BudgetSnapshot } from "@/lib/budget-snapshot-schema";
import { Button } from "@/components/ui/button";

const SEVERITY = {
  high: { label: "Pilne", cls: "bg-red-500/10 text-red-300" },
  medium: { label: "Uwaga", cls: "bg-amber-500/10 text-amber-300" },
  low: { label: "Do rozważenia", cls: "bg-sky-500/10 text-sky-300" },
} as const;

const CACHE_KEY = "payguard:ai-advice-v2";

interface Cached {
  advice: BudgetAdvice;
  at: number;
  monthLabel: string;
}

// Ostatnia analiza zostaje w pamięci karty przeglądarki, więc przejście na inną stronę jej nie kasuje.
function readCache(monthLabel: string): Cached | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    return parsed.monthLabel === monthLabel ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(value: Cached) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // brak dostępu do sessionStorage (np. tryb prywatny) - analiza po prostu nie zostanie zapamiętana
  }
}

export function AiAdvisorCard({ snapshot }: { snapshot: BudgetSnapshot }) {
  const [initial] = useState(() => readCache(snapshot.monthLabel));
  const [advice, setAdvice] = useState<BudgetAdvice | null>(initial?.advice ?? null);
  const [at, setAt] = useState<number | null>(initial?.at ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = snapshot.expenseCount > 0 || snapshot.recurring.length > 0;
  const savingsTotal = advice ? advice.savings.reduce((sum, s) => sum + s.monthlySaving, 0) : 0;

  async function analyze() {
    setLoading(true);
    setError(null);

    try {
      const res = await authedFetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ snapshot }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak.");
        return;
      }

      const now = Date.now();
      setAdvice(data.advice);
      setAt(now);
      writeCache({ advice: data.advice, at: now, monthLabel: snapshot.monthLabel });
    } catch {
      setError("Nie udało się połączyć z serwerem.");
      toast.error("Nie udało się połączyć z Doradcą AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/30 to-emerald-500/30 text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Doradca budżetu AI</h2>
            <p className="text-xs text-muted-foreground">Analizuje cały miesiąc. Napędzany przez Google Gemini</p>
          </div>
        </div>

        <Button
          onClick={analyze}
          disabled={loading || !hasData}
          className="gap-2 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizuję...
            </>
          ) : advice ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Odśwież analizę
            </>
          ) : (
            "Analizuj budżet"
          )}
        </Button>
      </div>

      <div className="relative mt-5" aria-live="polite">
        {!hasData && (
          <p className="text-sm text-muted-foreground">
            Dodaj kilka wydatków albo płatności cyklicznych, żeby AI miało co analizować.
          </p>
        )}

        {hasData && !advice && !loading && !error && (
          <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm leading-relaxed text-muted-foreground">
            Gemini przejrzy <span className="font-mono text-foreground">{snapshot.expenseCount}</span> wydatków w{" "}
            <span className="font-mono text-foreground">{snapshot.categories.length}</span> kategoriach i{" "}
            <span className="font-mono text-foreground">{snapshot.recurring.length}</span> płatności cyklicznych,
            sprawdzi limity i prognozę, a potem wskaże ryzyka oraz konkretne oszczędności.
            <p className="mt-2 text-xs">
              Do AI trafiają kategorie, sumy i nazwy płatności cyklicznych. Nie wysyłamy opisów wydatków ani adresu
              e-mail.
            </p>
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

        {error && !loading && <p className="text-sm text-red-400">{error}</p>}

        {advice && !loading && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {advice.headline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{advice.summary}</p>
            </div>

            {savingsTotal > 0 && (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Możliwe oszczędności</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-300">
                    {formatPLN(savingsTotal)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">/ mies.</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  to ok. <span className="font-mono text-foreground">{formatPLN(savingsTotal * 12)}</span> rocznie
                </p>
              </div>
            )}

            {(advice.risks.length > 0 || advice.savings.length > 0) && (
              <div className="grid gap-5 lg:grid-cols-2">
                {advice.risks.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-300" />
                      Co warto sprawdzić
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {advice.risks.map((risk, i) => {
                        const sev = SEVERITY[risk.severity];
                        return (
                          <li key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-foreground">{risk.title}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${sev.cls}`}>
                                {sev.label}
                              </span>
                            </div>
                            {risk.detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{risk.detail}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {advice.savings.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Target className="h-4 w-4 text-emerald-300" />
                      Gdzie możesz zaoszczędzić
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {advice.savings.map((saving, i) => (
                        <li key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{saving.title}</p>
                            {saving.monthlySaving > 0 && (
                              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-emerald-300">
                                −{formatPLN(saving.monthlySaving)}
                              </span>
                            )}
                          </div>
                          {saving.detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{saving.detail}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {advice.actions.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">Następne kroki</h3>
                <ul className="flex flex-col gap-2">
                  {advice.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                        <Check className="h-3 w-3" />
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              {at &&
                `Wygenerowano o ${new Date(at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}. `}
              Analiza AI może zawierać błędy i nie jest poradą finansową.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}