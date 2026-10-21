"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { monthKey, shiftMonth, shortMonthLabel } from "@/lib/dates";

export interface MonthTotal {
  month: string;
  label: string;
  fixed: number;
  variable: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// Sumy z kilku poprzednich miesięcy (bez bieżącego). Brakujące miesiące uzupełniamy zerami.
export function useMonthTotals(monthsBack: number, refreshKey: number) {
  const [totals, setTotals] = useState<MonthTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const current = monthKey();
      const { data, error } = await supabase.rpc("my_monthly_totals", {
        p_until: `${current}-01`,
        p_months: monthsBack,
      });

      if (cancelled) return;
      if (error) console.warn("Nie udało się pobrać sum miesięcy:", error.message);

      const byMonth = new Map<string, { fixed: number; variable: number }>();
      for (const row of (data ?? []) as Array<{ month: string; fixed: number | string; variable: number | string }>) {
        byMonth.set(row.month, { fixed: Number(row.fixed), variable: Number(row.variable) });
      }

      const result: MonthTotal[] = [];
      for (let i = monthsBack; i >= 1; i--) {
        const key = shiftMonth(current, -i);
        const v = byMonth.get(key) ?? { fixed: 0, variable: 0 };
        result.push({
          month: key,
          label: shortMonthLabel(key),
          fixed: round2(v.fixed),
          variable: round2(v.variable),
          total: round2(v.fixed + v.variable),
        });
      }

      setTotals(result);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [monthsBack, refreshKey]);

  return { totals, loading };
}