"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";

let lastRun = 0; // nie odpytujemy bazy częściej niż raz na minutę (np. przy zmianie podstron)

function plural(n: number) {
  if (n === 1) return "płatność cykliczną";
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
    ? "płatności cykliczne"
    : "płatności cyklicznych";
}

// Przy wejściu do aplikacji księguje zaległe płatności cykliczne (czynsz, Netflix...).
// Działa po stronie bazy, więc jest odporne na podwójne wywołanie.
export function useRecurringSync() {
  useEffect(() => {
    if (Date.now() - lastRun < 60_000) return;
    lastRun = Date.now();

    async function sync() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Przekazujemy lokalną datę użytkownika, żeby "dziś" zgadzało się z jego dniem
      const { data, error } = await supabase.rpc("post_my_due_recurring", {
        p_today: toISODate(new Date()),
      });

      if (error) {
        console.warn("Nie udało się zaksięgować płatności cyklicznych:", error.message);
        return;
      }

      const posted = Number(data ?? 0);
      if (posted > 0) {
        toast.success(`Zaksięgowano ${posted} ${plural(posted)}.`);
      }
    }

    sync();
  }, []);
}