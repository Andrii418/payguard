"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { NavSidebar } from "@/components/nav-sidebar";
import { KpiCard } from "@/components/kpi-card";
import { SpendingCharts } from "@/components/spending-charts";
import { UpcomingRenewals } from "@/components/upcoming-renewals";
import { AiAdvisorCard } from "@/components/ai-advisor-card";
import { SubscriptionPlanCard } from "@/components/subscription-plan-card";
import { BudgetAlertBanner } from "@/components/budget-alert-banner";
import { LoadingScreen } from "@/components/loading-screen";
import { Wallet, TrendingDown, CalendarClock, Layers } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const checkingAuth = useAuthGuard();
  const { subscriptions } = useSubscriptions(0);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const hasWarnedRef = useRef(false);

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

  const monthlyCost = subscriptions.reduce(
    (sum, s) => sum + (s.billing_cycle === "monthly" ? s.price : s.price / 12),
    0
  );

  const isOverBudget = budgetLimit !== null && monthlyCost > budgetLimit;

  useEffect(() => {
    if (isOverBudget && !hasWarnedRef.current) {
      toast.warning("Przekroczyłeś swój miesięczny limit budżetu!", {
        description: `Wydajesz ${monthlyCost.toFixed(2)} zł przy limicie ${budgetLimit?.toFixed(2)} zł.`,
      });
      hasWarnedRef.current = true;
    }
    if (!isOverBudget) {
      hasWarnedRef.current = false;
    }
  }, [isOverBudget, monthlyCost, budgetLimit]);

  if (checkingAuth) return <LoadingScreen />;

  const categoryGroups = subscriptions.reduce<Record<string, number[]>>((acc, s) => {
    const monthly = s.billing_cycle === "monthly" ? s.price : s.price / 12;
    acc[s.category] = acc[s.category] ? [...acc[s.category], monthly] : [monthly];
    return acc;
  }, {});

  const possibleSavings = Object.values(categoryGroups).reduce((sum, prices) => {
    if (prices.length <= 1) return sum;
    const [, ...duplicates] = [...prices].sort((a, b) => a - b);
    return sum + duplicates.reduce((s, p) => s + p, 0);
  }, 0);

  const today = new Date();
  const nextRenewalDays =
    subscriptions
      .map((s) => Math.ceil((new Date(s.next_renewal).getTime() - today.getTime()) / 86400000))
      .filter((d) => d >= 0)
      .sort((a, b) => a - b)[0] ?? 0;

  return (
    <div className="flex">
      <NavSidebar monthlyCost={monthlyCost} />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Przegląd finansowy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Twoje subskrypcje pod kontrolą — na żywo.
          </p>
        </header>

        {isOverBudget && budgetLimit !== null && (
          <BudgetAlertBanner monthlyCost={monthlyCost} budgetLimit={budgetLimit} />
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Miesięczny koszt"
            value={Math.round(monthlyCost * 100) / 100}
            suffix=" zł"
            icon={Wallet}
            glow
            index={0}
          />
          <KpiCard label="Aktywne subskrypcje" value={subscriptions.length} icon={Layers} index={1} />
          <KpiCard
            label="Możliwe oszczędności"
            value={Math.round(possibleSavings * 100) / 100}
            suffix=" zł"
            icon={TrendingDown}
            index={2}
          />
          <KpiCard
            label="Najbliższe odnowienie"
            value={nextRenewalDays}
            suffix=" dni"
            icon={CalendarClock}
            index={3}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SpendingCharts subscriptions={subscriptions} />
        </section>

        <section className="mt-6">
          <UpcomingRenewals subscriptions={subscriptions} />
        </section>

        <section id="advisor" className="mt-6 scroll-mt-8">
          <AiAdvisorCard subscriptions={subscriptions} />
        </section>

        <section className="mt-6">
          <SubscriptionPlanCard />
        </section>
      </main>
    </div>
  );
}