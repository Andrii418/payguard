"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NavSidebar } from "@/components/nav-sidebar";
import { KpiCard } from "@/components/kpi-card";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { SubscriptionList } from "@/components/subscription-list";
import { Wallet, TrendingDown, CalendarClock, Layers } from "lucide-react";
import { AiAdvisorCard } from "@/components/ai-advisor-card";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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
          <KpiCard label="Miesięczny koszt" value={247.5} suffix=" zł" icon={Wallet} glow />
          <KpiCard label="Aktywne subskrypcje" value={8} icon={Layers} />
          <KpiCard label="Możliwe oszczędności" value={62} suffix=" zł" icon={TrendingDown} />
          <KpiCard label="Najbliższe odnowienie" value={3} suffix=" dni" icon={CalendarClock} />
        </section>

        <section className="glass-card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Twoje subskrypcje
            </h2>
            <AddSubscriptionDialog onAdded={() => setRefreshKey((k) => k + 1)} />
          </div>

          <SubscriptionList refreshKey={refreshKey} />
        </section>
                <section className="mt-6">
          <AiAdvisorCard refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}