"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { NavSidebar } from "@/components/nav-sidebar";
import { KpiCard } from "@/components/kpi-card";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { SubscriptionList } from "@/components/subscription-list";
import { SpendingCharts } from "@/components/spending-charts";
import { UpcomingRenewals } from "@/components/upcoming-renewals";
import { AiAdvisorCard } from "@/components/ai-advisor-card";
import { Wallet, TrendingDown, CalendarClock, Layers } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { subscriptions, loading } = useSubscriptions(refreshKey);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Sprawdzanie sesji...</p>
      </div>
    );
  }

  // --- Obliczenia KPI na podstawie prawdziwych danych z bazy ---
  const monthlyCost = subscriptions.reduce(
    (sum, s) => sum + (s.billing_cycle === "monthly" ? s.price : s.price / 12),
    0
  );

  // Wykrywanie "duplikatów" kategorii jako przybliżony wskaźnik możliwych oszczędności:
  // jeśli w jednej kategorii jest więcej niż jedna subskrypcja, sumujemy wszystkie
  // oprócz najtańszej - to one są "nadmiarowe".
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
      <NavSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Przegląd finansowy
          </h1>
          <p className="mt-1 text-sm text-muted">
            Twoje subskrypcje pod kontrolą — na żywo.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Miesięczny koszt"
            value={Math.round(monthlyCost * 100) / 100}
            suffix=" zł"
            icon={Wallet}
            glow
          />
          <KpiCard label="Aktywne subskrypcje" value={subscriptions.length} icon={Layers} />
          <KpiCard
            label="Możliwe oszczędności"
            value={Math.round(possibleSavings * 100) / 100}
            suffix=" zł"
            icon={TrendingDown}
          />
          <KpiCard label="Najbliższe odnowienie" value={nextRenewalDays} suffix=" dni" icon={CalendarClock} />
        </section>

        <section className="glass-card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Twoje subskrypcje
            </h2>
            <AddSubscriptionDialog onAdded={() => setRefreshKey((k) => k + 1)} />
          </div>

          <SubscriptionList
            subscriptions={subscriptions}
            loading={loading}
            onDeleted={() => setRefreshKey((k) => k + 1)}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SpendingCharts subscriptions={subscriptions} />
        </section>

        <section className="mt-6">
          <UpcomingRenewals subscriptions={subscriptions} />
        </section>

        <section className="mt-6">
          <AiAdvisorCard subscriptions={subscriptions} />
        </section>
      </main>
    </div>
  );
}