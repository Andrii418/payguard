import { createClient } from "@supabase/supabase-js";

// Klient administracyjny — używa Secret Key i OMIJA RLS.
// Używaj go WYŁĄCZNIE w kodzie serwerowym (API routes, webhooki).
// Nigdy nie importuj tego pliku w komponencie oznaczonym "use client"!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);