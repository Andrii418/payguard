"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { formatPLN } from "@/lib/analytics";
import { monthKey, monthLabel } from "@/lib/dates";
import { summarizeMonth } from "@/lib/month-summary";
import { useBudgets } from "@/lib/use-budgets";
import { useExpenses } from "@/lib/use-expenses";
import { AnimatedNumber } from "@/components/animated-number";

function barClass(usage: number) {
  if (usage > 100) return "bg-linear-to-r from-red-500 to-orange-400";
  if (usage > 75) return "bg-linear-to-r from-amber-400 to-orange-400";
  return "bg-linear-to-r from-emerald-400 to-sky-400";
}

export function MonthBudgetCard({ subscriptionsMonthly }: { subscriptionsMonthly: number }) {
  const month = monthKey();
  const { expenses } = useExpenses(month, 0);
  const { limits } = useBudgets(0);

  const summary = summarizeMonth(expenses, subscriptionsMonthly, month);
  const limit = limits.total ?? null;
  const usage = limit ? (summary.total / limit) * 100 : null;
  const remaining = limit ? limit - summary.total : null;

  return (
    <div className="glass-card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-muted-foreground">Budżet miesiąca: {monthLabel(month)}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
            <AnimatedNumber value={summary.total} />
            <span className="ml-1.5 text-base font-normal text-muted-foreground">
              zł{limit ? ` z ${formatPLN(limit)}` : ""}
            </span>
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/expenses?new=1"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-obsidian transition-all hover:bg-emerald-400 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Dodaj wydatek
          </Link>
          <Link
            href="/expenses"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-foreground transition-colors hover:bg-white/[0.05]"
          >
            Szczegóły
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Podzial miesiaca na kategorie */}
      {summary.byCategory.length > 0 && (
        <div className="relative mt-5">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            {summary.byCategory.map((c) => (
              <div
                key={c.category}
                title={`${c.label}: ${formatPLN(c.spent)}`}
                style={{ width: `${c.share * 100}%`, backgroundColor: c.color }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {summary.byCategory.slice(0, 5).map((c) => (
              <span key={c.category} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-5">
        {limit && usage !== null && remaining !== null ? (
          <>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barClass(usage)}`}
                style={{ width: `${Math.min(usage, 100)}%` }}
              />
            </div>
            <p className={`mt-2 text-xs ${remaining < 0 ? "text-red-300" : "text-muted-foreground"}`}>
              {remaining < 0
                ? `Przekroczono budżet o ${formatPLN(Math.abs(remaining))}.`
                : `Zostało ${formatPLN(remaining)} (${Math.round(usage)}% wykorzystane).`}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Ustaw budżet miesięczny w{" "}
            <Link href="/expenses" className="text-foreground underline underline-offset-2 hover:text-emerald-300">
              sekcji Wydatki
            </Link>
            , a zobaczysz tu pasek wykorzystania.
          </p>
        )}
      </div>
    </div>
  );
}