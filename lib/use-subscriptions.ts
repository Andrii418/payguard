"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
  next_renewal: string;
}

// Jeden hook, z którego korzysta cały dashboard - jedno źródło prawdy o subskrypcjach.
export function useSubscriptions(refreshKey: number) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
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

  return { subscriptions, loading, refetch: fetchSubscriptions };
}