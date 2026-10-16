"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { useExpenses } from "@/lib/use-expenses";
import { useBudgets } from "@/lib/use-budgets";
import { totalMonthly } from "@/lib/analytics";
import { daysInMonth, monthKey, monthLabel, shiftMonth, toISODate } from "@/lib/dates";
import { comparablePrevious, summarizeMonth } from "@/lib/month-summary";
import { NavSidebar } from "@/components/nav-sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { LiveChip } from "@/components/live-chip";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { MonthHero } from "@/components/month-hero";
import { DailySpendingChart } from "@/components/daily-spending-chart";
import { CategoryBreakdown } from "@/components/category-breakdown";

function ExpensesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkingAuth = useAuthGuard();
  const [month, setMonth] = useState(monthKey);
  const [refreshKey, setRefreshKey] = useState(0);
  const amountRef = useRef<HTMLInputElement>(null);

  const { subscriptions } = useSubscriptions(refreshKey);
  const { expenses, loading, live } = useExpenses(month, refreshKey);
  const { limits, saveBudget } = useBudgets(refreshKey);

  // ?new=1 (z palety komend) ustawia fokus w polu kwoty szybkiego dodawania
  useEffect(() => {
    if (checkingAuth || !searchParams.get("new")) return;

    setMonth(monthKey());
    const timer = setTimeout(() => amountRef.current?.focus(), 80);
    router.replace("/expenses", { scroll: false });
    return () => clearTimeout(timer);
  }, [checkingAuth, searchParams, router]);

  const subsMonthly = totalMonthly(subscriptions);

  const summary = useMemo(() => summarizeMonth(expenses, subsMonthly, month), [expenses, subsMonthly, month]);
  const previous = useMemo(
    () => summarizeMonth(expenses, subsMonthly, shiftMonth(month, -1)),
    [expenses, subsMonthly, month]
  );
  const monthExpenses = useMemo(() => expenses.filter((e) => e.spent_on.startsWith(month)), [expenses, month]);

  if (checkingAuth) return <LoadingScreen />;

  const refresh = () => setRefreshKey((k) => k + 1);
  const current = monthKey();
  const isCurrent = month === current;

  // Domyslna data nowego wydatku: dzis (biezacy miesiac) albo ostatni dzien ogladanego miesiaca
  const defaultDate = isCurrent
    ? toISODate(new Date())
    : `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;

  return (
    <div className="flex min-h-screen">
      <NavSidebar monthlyCost={subsMonthly} />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-18 sm:px-6 lg:p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <LiveChip live={live} />
            <h1 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">Wydatki i budżet</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Zapisuj codzienne wydatki i pilnuj limitów razem z subskrypcjami.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isCurrent && (
              <button
                onClick={() => setMonth(current)}
                className="text-sm text-muted-foreground transition-colors hover:text-emerald-300"
              >
                Wróć do bieżącego
              </button>
            )}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                aria-label="Poprzedni miesiąc"
                onClick={() => setMonth((m) => shiftMonth(m, -1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[150px] text-center font-display text-sm font-medium capitalize text-foreground">
                {monthLabel(month)}
              </span>
              <button
                aria-label="Następny miesiąc"
                disabled={month >= current}
                onClick={() => setMonth((m) => shiftMonth(m, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section className="glass-card p-5">
          <p className="mb-3 text-xs text-muted-foreground">
            Szybkie dodawanie: wpisz kwotę i wciśnij <kbd className="font-mono">Enter</kbd>.
          </p>
          {/* key={month}: zmiana miesiaca resetuje formularz i domyslna date */}
          <ExpenseForm
            key={month}
            layout="inline"
            defaultDate={defaultDate}
            inputRef={amountRef}
            onSaved={refresh}
          />
        </section>

        <section className="mt-4">
          <MonthHero
            summary={summary}
            previousComparable={comparablePrevious(summary, previous)}
            limit={limits.total ?? null}
            onSaveLimit={(amount) => saveBudget("total", amount)}
          />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DailySpendingChart summary={summary} />
          </div>
          <div className="lg:col-span-2">
            <CategoryBreakdown summary={summary} limits={limits} onSaveLimit={saveBudget} />
          </div>
        </section>

        <section className="glass-card mt-4 p-5 sm:p-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Lista wydatków</h2>
            <span className="text-xs text-muted-foreground">
              <span className="font-mono text-foreground">{monthExpenses.length}</span> w tym miesiącu
            </span>
          </div>

          <ExpenseList
            expenses={monthExpenses}
            loading={loading}
            monthName={monthLabel(month)}
            onChanged={refresh}
          />
        </section>
      </main>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ExpensesContent />
    </Suspense>
  );
}