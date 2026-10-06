"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { exportSubscriptionsToCsv } from "@/lib/export-csv";
import { NavSidebar } from "@/components/nav-sidebar";
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog";
import { SubscriptionList } from "@/components/subscription-list";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const checkingAuth = useAuthGuard();
  const [refreshKey, setRefreshKey] = useState(0);
  const { subscriptions, loading } = useSubscriptions(refreshKey);

  if (checkingAuth) return <LoadingScreen />;

  const monthlyCost = subscriptions.reduce(
    (sum, s) => sum + (s.billing_cycle === "monthly" ? s.price : s.price / 12),
    0
  );

  function handleExport() {
    if (subscriptions.length === 0) {
      toast.error("Brak subskrypcji do wyeksportowania.");
      return;
    }
    exportSubscriptionsToCsv(subscriptions);
    toast.success("Plik CSV został pobrany.");
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
            <AddSubscriptionDialog onAdded={() => setRefreshKey((k) => k + 1)} />
          </div>
        </header>

        <section className="glass-card p-6">
          <SubscriptionList
            subscriptions={subscriptions}
            loading={loading}
            onDeleted={() => setRefreshKey((k) => k + 1)}
          />
        </section>
      </main>
    </div>
  );
}