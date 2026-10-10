import { supabase } from "@/lib/supabase";

const DEMO_BUDGET_LIMIT = 350;

interface DemoSubscription {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: "streaming" | "software" | "cloud" | "other";
  inDays: number; // za ile dni odnowienie, liczone od dziś
}

// Celowo kilka platform streamingowych - dzięki temu Doradca AI ma co wykrywać,
// a "możliwe oszczędności" w KPI nie jest zerem. Suma przekracza też limit
// budżetu, więc demo od razu pokazuje alert.
const DEMO_SUBSCRIPTIONS: DemoSubscription[] = [
  { name: "Netflix", price: 43.99, billing_cycle: "monthly", category: "streaming", inDays: 2 },
  { name: "Spotify", price: 23.99, billing_cycle: "monthly", category: "streaming", inDays: 5 },
  { name: "HBO Max", price: 29.99, billing_cycle: "monthly", category: "streaming", inDays: 9 },
  { name: "Disney+", price: 37.99, billing_cycle: "monthly", category: "streaming", inDays: 14 },
  { name: "GitHub Copilot", price: 40.0, billing_cycle: "monthly", category: "software", inDays: 6 },
  { name: "Notion", price: 39.0, billing_cycle: "monthly", category: "software", inDays: 17 },
  { name: "AWS", price: 120.5, billing_cycle: "monthly", category: "cloud", inDays: 20 },
  { name: "Domena payguard.pl", price: 69.0, billing_cycle: "yearly", category: "cloud", inDays: 45 },
  { name: "Siłownia", price: 129.0, billing_cycle: "monthly", category: "other", inDays: 11 },
];

// Daty liczymy względem "dziś", żeby demo zawsze wyglądało na żywe
// (odnowienia "za 2 dni", "za 5 dni"), a nie na zakurzone dane z przeszłości.
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function seedDemoData(userId: string): Promise<string | null> {
  const rows = DEMO_SUBSCRIPTIONS.map(({ inDays, ...s }) => ({
    user_id: userId,
    ...s,
    next_renewal: daysFromNow(inDays),
  }));

  const { error } = await supabase.from("subscriptions").insert(rows);
  if (error) return error.message;

  // Profil istnieje, bo tworzy go trigger na tabeli auth.users (Etap 5)
  await supabase.from("profiles").update({ budget_limit: DEMO_BUDGET_LIMIT }).eq("id", userId);

  return null;
}

export async function startDemo(): Promise<{ error: string | null }> {
  // Jeśli ktoś ma już sesję (demo albo prawdziwe konto), NIE tworzymy nowej -
  // inaczej nadpisalibyśmy sesję prawdziwego użytkownika anonimową.
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return { error: null };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    return { error: error?.message ?? "Nie udało się uruchomić trybu demo." };
  }

  return { error: await seedDemoData(data.user.id) };
}

export async function resetDemoData(): Promise<{ error: string | null }> {
  const { data } = await supabase.auth.getUser();

  // BEZPIECZNIK: reset kasuje wszystkie subskrypcje, więc wolno go wykonać
  // wyłącznie na koncie anonimowym. Prawdziwy użytkownik nigdy nie straci danych.
  if (!data.user?.is_anonymous) {
    return { error: "Reset jest dostępny tylko w trybie demo." };
  }

  const { error: deleteError } = await supabase
    .from("subscriptions")
    .delete()
    .eq("user_id", data.user.id);

  if (deleteError) return { error: deleteError.message };

  return { error: await seedDemoData(data.user.id) };
}