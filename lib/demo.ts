import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";

const DEMO_BUDGET_LIMIT = 350; // limit na subskrypcje (profiles.budget_limit)

interface DemoSubscription {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: "streaming" | "software" | "cloud" | "other";
  inDays: number; // za ile dni odnowienie, liczone od dzis
}

// Celowo kilka platform streamingowych - dzieki temu Doradca AI ma co wykrywac,
// a suma przekracza limit, wiec demo od razu pokazuje alert.
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

interface DemoExpense {
  description: string;
  category: "food" | "transport" | "home" | "bills" | "health" | "shopping" | "fun" | "other";
  amount: number;
}

// Wydatki biezacego miesiaca: daysAgo liczone wstecz od dzis (nie wychodzimy poza biezacy miesiac).
const DEMO_EXPENSES: Array<DemoExpense & { daysAgo: number }> = [
  { description: "Zakupy spożywcze", category: "food", amount: 213.8, daysAgo: 0 },
  { description: "Kawa i obiad", category: "food", amount: 46.5, daysAgo: 1 },
  { description: "Bilet miesięczny", category: "transport", amount: 110, daysAgo: 2 },
  { description: "Paliwo", category: "transport", amount: 245.3, daysAgo: 3 },
  { description: "Prąd", category: "bills", amount: 168.9, daysAgo: 4 },
  { description: "Kino", category: "fun", amount: 58, daysAgo: 5 },
  { description: "Apteka", category: "health", amount: 74.2, daysAgo: 6 },
  { description: "Zakupy spożywcze", category: "food", amount: 176.45, daysAgo: 7 },
  { description: "Bluza", category: "shopping", amount: 189, daysAgo: 8 },
  { description: "Obiad na mieście", category: "food", amount: 62, daysAgo: 9 },
  { description: "Taxi", category: "transport", amount: 38.5, daysAgo: 10 },
  { description: "Internet", category: "bills", amount: 59.99, daysAgo: 11 },
  { description: "Koncert", category: "fun", amount: 220, daysAgo: 12 },
  { description: "Zakupy spożywcze", category: "food", amount: 154.1, daysAgo: 13 },
  { description: "Fryzjer", category: "health", amount: 90, daysAgo: 15 },
  { description: "Prezent urodzinowy", category: "shopping", amount: 135, daysAgo: 17 },
  { description: "Parking", category: "transport", amount: 24, daysAgo: 19 },
  { description: "Zakupy spożywcze", category: "food", amount: 201.3, daysAgo: 21 },
];

// Poprzedni miesiac: stale dni, zeby przelacznik miesiecy mial co pokazac.
const DEMO_PREVIOUS_MONTH: Array<DemoExpense & { day: number }> = [
  { description: "Zakupy spożywcze", category: "food", amount: 198.2, day: 4 },
  { description: "Paliwo", category: "transport", amount: 380, day: 6 },
  { description: "Prąd", category: "bills", amount: 171.2, day: 9 },
  { description: "Zakupy spożywcze", category: "food", amount: 164.9, day: 11 },
  { description: "Kino i kolacja", category: "fun", amount: 140, day: 14 },
  { description: "Buty", category: "shopping", amount: 260, day: 18 },
  { description: "Dentysta", category: "health", amount: 55, day: 20 },
  { description: "Zakupy spożywcze", category: "food", amount: 189.5, day: 23 },
  { description: "Środki czystości", category: "home", amount: 92.4, day: 25 },
  { description: "Zakupy spożywcze", category: "food", amount: 142.3, day: 28 },
];

const DEMO_BUDGETS = [
  { category: "total", amount: 3200 },
  { category: "food", amount: 900 },
  { category: "transport", amount: 350 },
  { category: "fun", amount: 300 },
  { category: "shopping", amount: 400 },
];

// Daty liczymy wzgledem "dzis", zeby demo zawsze wygladalo na zywe.
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

async function seedDemoData(userId: string): Promise<string | null> {
  const subscriptionRows = DEMO_SUBSCRIPTIONS.map(({ inDays, ...s }) => ({
    user_id: userId,
    ...s,
    next_renewal: daysFromNow(inDays),
  }));

  const { error } = await supabase.from("subscriptions").insert(subscriptionRows);
  if (error) return error.message;

  const now = new Date();

  const currentRows = DEMO_EXPENSES.map(({ daysAgo, ...e }) => ({
    user_id: userId,
    ...e,
    spent_on: toISODate(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - daysAgo))),
  }));

  const previousRows = DEMO_PREVIOUS_MONTH.map(({ day, ...e }) => ({
    user_id: userId,
    ...e,
    spent_on: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, day)),
  }));

  // Wydatki i budzety sa dodatkiem - ich ewentualny blad nie blokuje startu demo.
  const { error: expensesError } = await supabase.from("expenses").insert([...currentRows, ...previousRows]);
  if (expensesError) console.warn("Nie udało się dodać wydatków demo:", expensesError.message);

  const { error: budgetsError } = await supabase
    .from("budgets")
    .insert(DEMO_BUDGETS.map((b) => ({ user_id: userId, ...b })));
  if (budgetsError) console.warn("Nie udało się dodać budżetów demo:", budgetsError.message);

  // Profil istnieje, bo tworzy go trigger na tabeli auth.users (Etap 5)
  await supabase.from("profiles").update({ budget_limit: DEMO_BUDGET_LIMIT }).eq("id", userId);

  return null;
}

export async function startDemo(): Promise<{ error: string | null }> {
  // Jesli ktos ma juz sesje (demo albo prawdziwe konto), NIE tworzymy nowej -
  // inaczej nadpisalibysmy sesje prawdziwego uzytkownika anonimowa.
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

  // BEZPIECZNIK: reset kasuje dane, wiec wolno go wykonac wylacznie na koncie anonimowym.
  // Prawdziwy uzytkownik nigdy nie straci danych.
  if (!data.user?.is_anonymous) {
    return { error: "Reset jest dostępny tylko w trybie demo." };
  }

  const userId = data.user.id;

  const { error: deleteError } = await supabase.from("subscriptions").delete().eq("user_id", userId);
  if (deleteError) return { error: deleteError.message };

  await supabase.from("expenses").delete().eq("user_id", userId);
  await supabase.from("budgets").delete().eq("user_id", userId);

  return { error: await seedDemoData(userId) };
}