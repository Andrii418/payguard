"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { useExpenses } from "@/lib/use-expenses";
import { useBudgets } from "@/lib/use-budgets";
import { useMonthTotals } from "@/lib/use-month-totals";
import { monthlyEquivalent } from "@/lib/analytics";
import { monthKey, shiftMonth } from "@/lib/dates";
import { comparablePrevious, scheduledRemaining, summarizeMonth } from "@/lib/month-summary";
import { buildBudgetSnapshot } from "@/lib/budget-snapshot";
import { buildInsights } from "@/lib/insights";
import { NavSidebar } from "@/components/nav-sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { LiveChip } from "@/components/live-chip";
import { ExpenseForm } from "@/components/expense-form";
import { InsightsStrip } from "@/components/insights-strip";
import { MonthHero } from "@/components/month-hero";
import { UpcomingRenewals } from "@/components/upcoming-renewals";
import { TrendChart } from "@/components/trend-chart";
import { CategoryDonut } from "@/components/category-donut";
import { AiAdvisorCard } from "@/components/ai-advisor-card";

export default function DashboardPage() {
  const checkingAuth = useAuthGuard();
  const [refreshKey, setRefreshKey] = useState(0);
  const month = monthKey();

  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions(refreshKey);
  const { expenses, loading: expensesLoading, live } = useExpenses(month, refreshKey);
  const { limits, saveBudget } = useBudgets(refreshKey);
  const { totals: history } = useMonthTotals(5, refreshKey);

  const scheduled = scheduledRemaining(subscriptions);

  const summary = useMemo(
    () => summarizeMonth(expenses, month, scheduled),
    [expenses, month, scheduled]
  );
  const previous = useMemo(() => summarizeMonth(expenses, shiftMonth(month, -1)), [expenses, month]);

  const snapshot = useMemo(
    () => buildBudgetSnapshot({ expenses, subscriptions, limits, month }),
    [expenses, subscriptions, limits, month]
  );

  const subscriptionsMonthly = subscriptions
    .filter((s) => s.kind === "subscription")
    .reduce((sum, s) => sum + monthlyEquivalent(s), 0);

  const insights = useMemo(
    () => buildInsights({ summary, limits, subscriptionsMonthly }),
    [summary, limits, subscriptionsMonthly]
  );

  if (checkingAuth) return <LoadingScreen />;

  const refresh = () => setRefreshKey((k) => k + 1);
  const isEmpty =
    !expensesLoading && !subscriptionsLoading && expenses.length === 0 && subscriptions.length === 0;

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex min-h-screen">
      <NavSidebar />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-18 sm:px-6 lg:p-8">
        <header className="mb-6">
          <LiveChip live={live} />
          <p className="mt-3 text-sm capitalize text-muted-foreground">{today}</p>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Przegląd budżetu</h1>
        </header>

        <InsightsStrip insights={insights} />

        {isEmpty && (
          <section className="glass-card relative mb-4 overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
            <h2 className="relative font-display text-xl font-semibold text-foreground">
              Zacznij od jednego wydatku
            </h2>
            <p className="relative mt-2 max-w-xl text-sm text-muted-foreground">
              Wpisz poniżej kwotę ostatniego zakupu. Stałe opłaty (czynsz, Netflix) dodasz w sekcji Cykliczne,
              a będą się księgować same w dniu płatności.
            </p>
            <Link
              href="/subscriptions?new=1"
              className="relative mt-4 inline-flex items-center gap-2 text-sm text-emerald-300 transition-colors hover:text-emerald-200"
            >
              <Repeat className="h-4 w-4" />
              Dodaj płatność cykliczną
            </Link>
          </section>
        )}

        <section className="glass-card p-5">
          <p className="mb-3 text-xs text-muted-foreground">
            Szybkie dodawanie: wpisz kwotę i wciśnij <kbd className="font-mono">Enter</kbd>.
          </p>
          <ExpenseForm layout="inline" onSaved={refresh} />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MonthHero
              summary={summary}
              previousComparable={comparablePrevious(summary, previous)}
              limit={limits.total ?? null}
              onSaveLimit={(amount) => saveBudget("total", amount)}
            />
          </div>
          <div className="lg:col-span-2">
            <UpcomingRenewals subscriptions={subscriptions} />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TrendChart history={history} current={summary} />
          </div>
          <div className="lg:col-span-2">
            <CategoryDonut summary={summary} />
          </div>
        </section>

        <section id="advisor" className="mt-4 scroll-mt-20 lg:scroll-mt-8">
          <AiAdvisorCard snapshot={snapshot} />
        </section>
      </main>
    </div>
  );
}