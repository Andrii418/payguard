"use client";

import { useMemo, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import {
  defaultFilters,
  filterAndSortSubscriptions,
  type SubscriptionFilters,
} from "@/lib/filter-subscriptions";
import { exportSubscriptionsToCsv } from "@/lib/export-csv";
import { NavSidebar } from "@/components/nav-sidebar";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { SubscriptionList } from "@/components/subscription-list";
import { SubscriptionFiltersBar } from "@/components/subscription-filters";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Download, SearchX } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const checkingAuth = useAuthGuard();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<SubscriptionFilters>(defaultFilters);
  const { subscriptions, loading } = useSubscriptions(refreshKey);

  // useMemo: filtrujemy/sortujemy ponownie tylko, gdy zmienią się dane lub filtry
  const visibleSubscriptions = useMemo(
    () => filterAndSortSubscriptions(subscriptions, filters),
    [subscriptions, filters]
  );

  if (checkingAuth) return <LoadingScreen />;

  const monthlyCost = subscriptions.reduce(
    (sum, s) => sum + (s.billing_cycle === "monthly" ? s.price : s.price / 12),
    0
  );

  const refresh = () => setRefreshKey((k) => k + 1);
  const hasActiveFilters = filters.query !== "" || filters.category !== "all";
  const noResults = !loading && subscriptions.length > 0 && visibleSubscriptions.length === 0;

  function handleExport() {
    if (visibleSubscriptions.length === 0) {
      toast.error("Brak subskrypcji do wyeksportowania.");
      return;
    }
    // Eksportujemy to, co użytkownik aktualnie widzi (z uwzględnieniem filtrów)
    exportSubscriptionsToCsv(visibleSubscriptions);
    toast.success(`Pobrano plik CSV (${visibleSubscriptions.length} pozycji).`);
  }

  return (
    <div className="flex">
      <NavSidebar monthlyCost={monthlyCost} />

      <main className="flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Subskrypcje</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pełna lista Twoich aktywnych subskrypcji.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2 border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
            >
              <Download className="h-4 w-4" />
              Eksportuj CSV
            </Button>
            <AddSubscriptionDialog onAdded={refresh} />
          </div>
        </header>

        <section className="glass-card p-6">
          {subscriptions.length > 0 && (
            <SubscriptionFiltersBar
              filters={filters}
              onChange={setFilters}
              shown={visibleSubscriptions.length}
              total={subscriptions.length}
            />
          )}

          {noResults ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Żadna subskrypcja nie pasuje do wybranych filtrów.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultFilters)}
                  className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                >
                  Wyczyść filtry
                </Button>
              )}
            </div>
          ) : (
            <SubscriptionList
              subscriptions={visibleSubscriptions}
              loading={loading}
              onChanged={refresh}
            />
          )}
        </section>
      </main>
    </div>
  );
}