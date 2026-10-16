"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus, SearchX, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import {
  defaultFilters,
  filterAndSortSubscriptions,
  type SubscriptionFilters,
} from "@/lib/filter-subscriptions";
import { exportSubscriptionsToCsv } from "@/lib/export-csv";
import { totalMonthly } from "@/lib/analytics";
import { ctaPrimary } from "@/lib/ui-classes";
import { NavSidebar } from "@/components/nav-sidebar";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { SubscriptionList, type ViewMode } from "@/components/subscription-list";
import { SubscriptionToolbar } from "@/components/subscription-filters";
import { SubscriptionStats } from "@/components/subscription-stats";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";

const VIEW_KEY = "payguard:subscriptions-view";

// Zapamietany widok (lista/kafelki). Wywolywane jako inicjalizator stanu.
function readStoredView(): ViewMode {
  if (typeof window === "undefined") return "list";
  try {
    return window.localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

function LiveChip({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        live
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-white/[0.04] text-muted-foreground"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`}
        />
      </span>
      {live ? "Synchronizacja na żywo" : "Łączenie..."}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card relative overflow-hidden px-6 py-20 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
        <Wallet className="h-8 w-8" />
      </div>
      <h2 className="relative mt-6 font-display text-2xl font-semibold text-foreground">
        Zacznij od pierwszej subskrypcji
      </h2>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Dodaj Netflixa, Spotify albo cokolwiek, co odnawia się co miesiąc. Wykresy, alerty i porady AI pojawią się
        same.
      </p>
      <button onClick={onAdd} className={`${ctaPrimary} relative mt-8`}>
        <Plus className="h-4 w-4" />
        Dodaj subskrypcję
      </button>
    </div>
  );
}

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkingAuth = useAuthGuard();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<SubscriptionFilters>(defaultFilters);
  const [view, setView] = useState<ViewMode>(readStoredView);
  const [addOpen, setAddOpen] = useState(false);
  const { subscriptions, loading, live } = useSubscriptions(refreshKey);

  // Parametry z URL ustawia paleta komend (?q=Netflix, ?new=1). Po zastosowaniu czyscimy adres.
  useEffect(() => {
    const q = searchParams.get("q");
    const wantsNew = searchParams.get("new");
    if (q === null && !wantsNew) return;

    if (q !== null) setFilters({ ...defaultFilters, query: q });
    if (wantsNew) setAddOpen(true);
    router.replace("/subscriptions", { scroll: false });
  }, [searchParams, router]);

  const visible = useMemo(
    () => filterAndSortSubscriptions(subscriptions, filters),
    [subscriptions, filters]
  );

  if (checkingAuth) return <LoadingScreen />;

  const monthlyCost = totalMonthly(subscriptions);
  const refresh = () => setRefreshKey((k) => k + 1);
  const isEmpty = !loading && subscriptions.length === 0;
  const hasData = subscriptions.length > 0;
  const noResults = !loading && hasData && visible.length === 0;

  function changeView(next: ViewMode) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // brak dostepu do localStorage (np. tryb prywatny) - widok po prostu nie zostanie zapamietany
    }
  }

  function handleExport() {
    if (visible.length === 0) {
      toast.error("Brak subskrypcji do wyeksportowania.");
      return;
    }
    // Eksportujemy to, co uzytkownik aktualnie widzi (z uwzglednieniem filtrow)
    exportSubscriptionsToCsv(visible);
    toast.success(`Pobrano plik CSV (${visible.length} pozycji).`);
  }

  return (
    <div className="flex min-h-screen">
      <NavSidebar monthlyCost={monthlyCost} />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-18 sm:px-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <LiveChip live={live} />
            <h1 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">Subskrypcje</h1>
            <p className="mt-1 text-sm text-muted-foreground">Wszystko, za co płacisz, w jednym miejscu.</p>
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
            <AddSubscriptionDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refresh} />
          </div>
        </header>

        {isEmpty ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <>
            {hasData && <SubscriptionStats subscriptions={subscriptions} />}

            <section className={`glass-card p-5 sm:p-6 ${hasData ? "mt-6" : ""}`}>
              {hasData && (
                <SubscriptionToolbar
                  subscriptions={subscriptions}
                  filters={filters}
                  onChange={setFilters}
                  view={view}
                  onViewChange={changeView}
                  shown={visible.length}
                  total={subscriptions.length}
                />
              )}

              {noResults ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <SearchX className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Żadna subskrypcja nie pasuje do wybranych filtrów.</p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters(defaultFilters)}
                    className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                  >
                    Wyczyść filtry
                  </Button>
                </div>
              ) : (
                <SubscriptionList
                  subscriptions={visible}
                  loading={loading}
                  view={view}
                  totalMonthlyCost={monthlyCost}
                  onChanged={refresh}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubscriptionsContent />
    </Suspense>
  );
}