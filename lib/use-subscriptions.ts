"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
  next_renewal: string;
}

export function useSubscriptions(refreshKey: number) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // silent = odswiezenie "w tle" (bez migania szkieletow ladowania)
  const fetchSubscriptions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .order("next_renewal", { ascending: true });

    setSubscriptions(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions, refreshKey]);

  // --- Realtime: kazda zmiana w bazie odswieza liste bez przeladowania strony ---
  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function connect() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;

      channel = supabase
        .channel(`subscriptions-${data.user.id}-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${data.user.id}`,
          },
          () => {
            // Debounce: seria zmian (np. reset demo = 9 wstawien) to jedno odswiezenie, nie dziewiec.
            clearTimeout(timer);
            timer = setTimeout(() => fetchSubscriptions(true), 250);
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
  }, [fetchSubscriptions]);

  return { subscriptions, loading, live, refetch: fetchSubscriptions };
}