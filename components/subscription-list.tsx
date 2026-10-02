"use client";

import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import type { Subscription } from "@/lib/use-subscriptions";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loading: boolean;
  onDeleted: () => void;
}

export function SubscriptionList({ subscriptions, loading, onDeleted }: SubscriptionListProps) {
  async function handleDelete(id: string) {
    await supabase.from("subscriptions").delete().eq("id", id);
    onDeleted();
  }

  if (loading) {
    return <p className="text-sm text-muted">Ładowanie subskrypcji...</p>;
  }

  if (subscriptions.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nie masz jeszcze żadnych subskrypcji — dodaj pierwszą powyżej.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-emerald-500/10">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">{sub.name}</p>
            <p className="text-xs text-muted">
              {sub.category} · odnowienie {new Date(sub.next_renewal).toLocaleDateString("pl-PL")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-emerald-400">
              {sub.price.toFixed(2)} zł
              <span className="text-muted">/{sub.billing_cycle === "monthly" ? "mies." : "rok"}</span>
            </span>
            <button
              onClick={() => handleDelete(sub.id)}
              className="text-muted transition-colors hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}