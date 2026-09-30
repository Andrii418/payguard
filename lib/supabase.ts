import { createClient } from "@supabase/supabase-js";

// Klient Supabase używany w komponentach po stronie przeglądarki.
// Klucz "anon" jest bezpieczny do ujawnienia publicznie - to RLS chroni dane, nie ten klucz.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);