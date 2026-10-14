"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { nextMonthStart, shiftMonth } from "@/lib/dates";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  spent_on: string; // YYYY-MM-DD
}

export function useExpenses(month: string, refreshKey: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  const fetchExpenses = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      const { data } = await supabase
        .from("expenses")
        .select("*")
        .gte("spent_on", `${shiftMonth(month, -1)}-01`)
        .lt("spent_on", nextMonthStart(month))
        .order("spent_on", { ascending: false })
        .order("created_at", { ascending: false });

      setExpenses(((data ?? []) as Expense[]).map((e) => ({ ...e, amount: Number(e.amount) })));
      setLoading(false);
    },
    [month]
  );

  // Ref z najnowsza funkcja pobierania - dzieki temu zmiana miesiaca nie zrywa polaczenia realtime.
  const fetchRef = useRef(fetchExpenses);
  useEffect(() => {
    fetchRef.current = fetchExpenses;
  }, [fetchExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function connect() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;

      channel = supabase
        .channel(`expenses-${data.user.id}-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${data.user.id}` },
          () => {
            clearTimeout(timer);
            timer = setTimeout(() => fetchRef.current(true), 250);
          }
        )
        .subscribe((status) => {
          if (!cancelled) setLive(status === "SUBSCRIBED");
        });
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { expenses, loading, live };
}