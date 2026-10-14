"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatPLN } from "@/lib/analytics";
import { monthLabel } from "@/lib/dates";
import type { MonthSummary } from "@/lib/month-summary";
import { AnimatedNumber } from "@/components/animated-number";
import { LimitEditor } from "@/components/limit-editor";

function barClass(usage: number) {
  if (usage > 100) return "bg-linear-to-r from-red-500 to-orange-400";
  if (usage > 75) return "bg-linear-to-r from-amber-400 to-orange-400";
  return "bg-linear-to-r from-emerald-400 to-sky-400";
}

function Tile({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-lg font-semibold tabular-nums text-foreground">{children}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface MonthHeroProps {
  summary: MonthSummary;
  previousComparable: number;
  limit: number | null;
  onSaveLimit: (amount: number | null) => Promise<string | null>;
}

export function MonthHero({ summary, previousComparable, limit, onSaveLimit }: MonthHeroProps) {
  const { total, expensesTotal, subscriptionsTotal, isCurrent, daysTotal, daysElapsed } = summary;

  const usage = limit ? (total / limit) * 100 : null;
  const remaining = limit ? limit - total : null;
  const daysLeft = isCurrent ? daysTotal - daysElapsed + 1 : 0; // wliczamy dzisiejszy dzien
  const perDayLeft = remaining !== null && remaining > 0 && daysLeft > 0 ? remaining / daysLeft : null;

  const delta = previousComparable > 0 ? ((expensesTotal - previousComparable) / previousComparable) * 100 : null;
  const deltaGood = delta !== null && delta <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 animate-pulse-glow rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

      <p className="relative text-sm capitalize text-muted-foreground">Razem w miesiącu: {monthLabel(summary.month)}</p>

      <div className="relative mt-2 flex items-baseline gap-2">
        <span className="font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
          <AnimatedNumber value={total} />
        </span>
        <span className="font-mono text-xl text-muted-foreground">zł</span>
      </div>

      <p className="relative mt-2 text-sm text-muted-foreground">
        w tym <span className="font-mono text-foreground">{formatPLN(expensesTotal)}</span> wydatków i{" "}
        <span className="font-mono text-foreground">{formatPLN(subscriptionsTotal)}</span> subskrypcji
      </p>

      {/* Budzet calego miesiaca */}
      <div className="relative mt-6">
        {limit && usage !== null && remaining !== null ? (
          <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Wykorzystano{" "}
                <span className="font-mono font-semibold tabular-nums text-foreground">{Math.round(usage)}%</span>{" "}
                budżetu
              </span>
              <LimitEditor value={limit} onSave={onSaveLimit} />
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usage, 100)}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${barClass(usage)}`}
              />
            </div>

            <p className={`mt-2 text-sm ${remaining < 0 ? "text-red-300" : "text-muted-foreground"}`}>
              {remaining < 0 ? (
                <>
                  Przekroczono budżet o <span className="font-mono">{formatPLN(Math.abs(remaining))}</span>.
                </>
              ) : (
                <>
                  Zostało <span className="font-mono text-foreground">{formatPLN(remaining)}</span>
                  {perDayLeft !== null && (
                    <>
                      {" "}
                      (ok. <span className="font-mono text-foreground">{formatPLN(perDayLeft)}</span> dziennie do
                      końca miesiąca)
                    </>
                  )}
                  .
                </>
              )}
            </p>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-dashed border-white/10 p-4">
            <p className="text-sm text-muted-foreground">Nie masz jeszcze budżetu na ten miesiąc.</p>
            <LimitEditor value={null} onSave={onSaveLimit} emptyLabel="Ustaw budżet miesięczny" />
          </div>
        )}
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Średnio dziennie" hint="same wydatki, bez subskrypcji">
          {formatPLN(summary.dailyAverage)}
        </Tile>

        {summary.projectedTotal !== null ? (
          <Tile label="Prognoza na koniec miesiąca" hint="wg dotychczasowego tempa">
            {formatPLN(summary.projectedTotal)}
          </Tile>
        ) : (
          <Tile label="Liczba wydatków">{summary.count}</Tile>
        )}

        <Tile
          label="Wydatki vs poprzedni miesiąc"
          hint={isCurrent ? "do tego samego dnia miesiąca" : "cały poprzedni miesiąc"}
        >
          {delta === null ? (
            "—"
          ) : (
            <span className={`inline-flex items-center gap-1.5 ${deltaGood ? "text-emerald-300" : "text-red-300"}`}>
              {deltaGood ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              {delta > 0 ? "+" : ""}
              {Math.round(delta)}%
            </span>
          )}
        </Tile>
      </div>
    </motion.div>
  );
}