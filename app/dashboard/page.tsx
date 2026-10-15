"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Layers, PiggyBank, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { MonthBudgetCard } from "@/components/month-budget-card";
import {
  activeCategories,
  nextRenewal,
  possibleSavings,
  totalMonthly,
} from "@/lib/analytics";
import { NavSidebar } from "@/components/nav-sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { BudgetAlertBanner } from "@/components/budget-alert-banner";
import { DashboardHero } from "@/components/dashboard-hero";
import { KpiCard } from "@/components/kpi-card";
import { CategoryChartCard, BurnRateChartCard } from "@/components/spending-charts";
import { UpcomingRenewals } from "@/components/upcoming-renewals";
import { AiAdvisorCard } from "@/components/ai-advisor-card";

export default function DashboardPage() {
  const checkingAuth = useAuthGuard();
  const [refreshKey, setRefreshKey] = useState(0);
  const { subscriptions } = useSubscriptions(refreshKey);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const hasWarnedRef = useRef(false);

  const monthlyCost = totalMonthly(subscriptions);
  const isOverBudget = budgetLimit !== null && monthlyCost > budgetLimit;

  useEffect(() => {
    if (checkingAuth) return;

    supabase.auth.getUser().then(async ({ data: userData }) => {
      if (!userData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("budget_limit")
        .eq("id", userData.user.id)
        .single();

      setBudgetLimit(profile?.budget_limit ?? null);
    });
  }, [checkingAuth]);

  useEffect(() => {
    if (isOverBudget && !hasWarnedRef.current) {
      toast.warning("Przekroczyłeś swój miesięczny limit budżetu!", {
        description: `Wydajesz ${monthlyCost.toFixed(2)} zł przy limicie ${budgetLimit?.toFixed(2)} zł.`,
      });
      hasWarnedRef.current = true;
    }
    if (!isOverBudget) hasWarnedRef.current = false;
  }, [isOverBudget, monthlyCost, budgetLimit]);

  if (checkingAuth) return <LoadingScreen />;

  const refresh = () => setRefreshKey((k) => k + 1);
  const savings = possibleSavings(subscriptions);
  const next = nextRenewal(subscriptions);
  const categoryCount = activeCategories(subscriptions).length;
  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex min-h-screen">
      <NavSidebar monthlyCost={monthlyCost} />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm capitalize text-muted-foreground">{today}</p>
            <h1 className="font-display text-3xl font-semibold text-foreground">Przegląd finansowy</h1>
          </div>
          <AddSubscriptionDialog onAdded={refresh} />
        </header>

        {isOverBudget && budgetLimit !== null && (
          <BudgetAlertBanner monthlyCost={monthlyCost} budgetLimit={budgetLimit} />
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <DashboardHero
            subscriptions={subscriptions}
            monthlyCost={monthlyCost}
            budgetLimit={budgetLimit}
          />

          <div className="grid grid-cols-2 auto-rows-fr gap-4 lg:col-span-2">
            <KpiCard
              label="Aktywne subskrypcje"
              value={subscriptions.length}
              icon={Layers}
              accent="sky"
              hint={`w ${categoryCount} ${categoryCount === 1 ? "kategorii" : "kategoriach"}`}
              index={0}
            />
            <KpiCard
              label="Możliwe oszczędności"
              value={savings}
              decimals={2}
              suffix="zł"
              icon={PiggyBank}
              accent="emerald"
              hint="na podstawie nakładających się usług"
              index={1}
            />
            <KpiCard
              label="Najbliższe odnowienie"
              value={next?.days ?? 0}
              suffix="dni"
              icon={CalendarClock}
              accent="amber"
              hint={next?.name ?? "brak zaplanowanych"}
              index={2}
            />
            <KpiCard
              label="Projekcja roczna"
              value={monthlyCost * 12}
              decimals={0}
              suffix="zł"
              icon={TrendingUp}
              accent="violet"
              hint="przy obecnych subskrypcjach"
              index={3}
            />
          </div>
        </section>

        <section className="mt-4">
          <MonthBudgetCard subscriptionsMonthly={monthlyCost} />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CategoryChartCard subscriptions={subscriptions} />
          </div>
          <div className="lg:col-span-3">
            <BurnRateChartCard subscriptions={subscriptions} />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <UpcomingRenewals subscriptions={subscriptions} />
          </div>
          <div id="advisor" className="scroll-mt-8 lg:col-span-3">
            <AiAdvisorCard subscriptions={subscriptions} />
          </div>
        </section>
      </main>
    </div>
  );
}