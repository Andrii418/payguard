import { supabase } from "@/lib/supabase";

type AuthedInit = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

export async function authedFetch(input: string, init: AuthedInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}