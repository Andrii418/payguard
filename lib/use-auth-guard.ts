"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Jeden hook odpowiedzialny za ochronę trasy - używany na każdej podstronie
// wymagającej zalogowania, zamiast kopiowania tej samej logiki wszędzie.
export function useAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  return checking;
}