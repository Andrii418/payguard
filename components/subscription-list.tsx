"use client";

import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Subscription } from "@/lib/use-subscriptions";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loading: boolean;
  onDeleted: () => void;
}

export function SubscriptionList({ subscriptions, loading, onDeleted }: SubscriptionListProps) {
  async function handleDelete(sub: Subscription) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", sub.id);

    if (error) {
      toast.error("Nie udało się usunąć subskrypcji.", { description: error.message });
      return;
    }

    toast.success(`Usunięto "${sub.name}".`);
    onDeleted();
  }

  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-emerald-500/10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-white/[0.05]" />
              <Skeleton className="h-3 w-48 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-4 w-16 bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              {sub.category} · odnowienie {new Date(sub.next_renewal).toLocaleDateString("pl-PL")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-emerald-400">
              {sub.price.toFixed(2)} zł
              <span className="text-muted-foreground">
                /{sub.billing_cycle === "monthly" ? "mies." : "rok"}
              </span>
            </span>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button className="text-muted-foreground transition-colors hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
              <AlertDialogContent className="glass-card border-emerald-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">Usunąć subskrypcję?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Na pewno chcesz usunąć &quot;{sub.name}&quot;? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(sub)}
                    className="bg-red-500 text-white hover:bg-red-500/90"
                  >
                    Usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}