import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Sprawdza token sesji z nagłówka Authorization. Dzięki temu tożsamość pochodzi
// z weryfikowanego tokenu, a nie z danych w treści zapytania (te można sfałszować).
export async function getAuthenticatedUser(req: NextRequest) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user;
}