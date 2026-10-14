"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type BudgetMap = Record<string, number>;

export function useBudgets(refreshKey: number) {
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [subscriptionsLimit, setSubscriptionsLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const [{ data: rows }, { data: profile }] = await Promise.all([
      supabase.from("budgets").select("category, amount"),
      supabase.from("profiles").select("budget_limit").eq("id", userData.user.id).single(),
    ]);

    const map: BudgetMap = {};
    for (const row of rows ?? []) map[row.category] = Number(row.amount);

    setBudgets(map);
    setSubscriptionsLimit(profile?.budget_limit ? Number(profile.budget_limit) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Zwraca komunikat bledu albo null, gdy zapis sie udal.
  const saveBudget = useCallback(
    async (category: string, amount: number | null): Promise<string | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return "Brak sesji. Zaloguj się ponownie.";

      let errorMessage: string | null = null;

      if (category === "subscriptions") {
        const { error } = await supabase
          .from("profiles")
          .update({ budget_limit: amount, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        errorMessage = error?.message ?? null;
      } else if (amount === null) {
        const { error } = await supabase
          .from("budgets")
          .delete()
          .eq("user_id", user.id)
          .eq("category", category);
        errorMessage = error?.message ?? null;
      } else {
        const { error } = await supabase
          .from("budgets")
          .upsert(
            { user_id: user.id, category, amount, updated_at: new Date().toISOString() },
            { onConflict: "user_id,category" }
          );
        errorMessage = error?.message ?? null;
      }

      if (errorMessage) return errorMessage;
      await load();
      return null;
    },
    [load]
  );

  const limits = useMemo<BudgetMap>(
    () => ({ ...budgets, ...(subscriptionsLimit ? { subscriptions: subscriptionsLimit } : {}) }),
    [budgets, subscriptionsLimit]
  );

  return { limits, loading, saveBudget };
}