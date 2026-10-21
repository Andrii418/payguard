import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";

const DEMO_SUBSCRIPTION_LIMIT = 350; // limit na subskrypcje (profiles.budget_limit)

interface DemoRecurring {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
  kind: "subscription" | "fixed";
  inDays: number; // za ile dni najbliższa płatność, liczone od dziś (ujemne = już minęła)
}

// Funkcja, a nie stała: "pierwszy dzień miesiąca" zależy od dnia, w którym ktoś uruchomi demo.
function buildRecurring(): DemoRecurring[] {
  const monthStart = 1 - new Date().getDate();

  return [
    // Czynsz ma termin 1. dnia miesiąca, więc silnik zaksięguje go sam po wejściu do aplikacji
    { name: "Czynsz", price: 1850, billing_cycle: "monthly", category: "home", kind: "fixed", inDays: monthStart },
    { name: "Netflix", price: 43.99, billing_cycle: "monthly", category: "fun", kind: "subscription", inDays: 2 },
    { name: "Spotify", price: 23.99, billing_cycle: "monthly", category: "fun", kind: "subscription", inDays: 5 },
    { name: "HBO Max", price: 29.99, billing_cycle: "monthly", category: "fun", kind: "subscription", inDays: 9 },
    { name: "Disney+", price: 37.99, billing_cycle: "monthly", category: "fun", kind: "subscription", inDays: 14 },
    { name: "GitHub Copilot", price: 40, billing_cycle: "monthly", category: "work", kind: "subscription", inDays: 6 },
    { name: "Notion", price: 39, billing_cycle: "monthly", category: "work", kind: "subscription", inDays: 17 },
    { name: "AWS", price: 120.5, billing_cycle: "monthly", category: "work", kind: "subscription", inDays: 20 },
    { name: "Domena payguard.pl", price: 69, billing_cycle: "yearly", category: "work", kind: "subscription", inDays: 45 },
    { name: "Telefon", price: 49, billing_cycle: "monthly", category: "bills", kind: "fixed", inDays: 8 },
    { name: "Internet", price: 59.99, billing_cycle: "monthly", category: "bills", kind: "fixed", inDays: 11 },
    { name: "Siłownia", price: 129, billing_cycle: "monthly", category: "health", kind: "fixed", inDays: 11 },
  ];
}

interface DemoExpense {
  description: string;
  category: string;
  amount: number;
  recurring_kind?: "subscription" | "fixed";
}

// Wydatki zmienne bieżącego miesiąca: daysAgo liczone wstecz od dziś (nie wychodzimy poza bieżący miesiąc).
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
  { description: "Koncert", category: "fun", amount: 220, daysAgo: 12 },
  { description: "Zakupy spożywcze", category: "food", amount: 154.1, daysAgo: 13 },
  { description: "Fryzjer", category: "health", amount: 90, daysAgo: 15 },
  { description: "Prezent urodzinowy", category: "shopping", amount: 135, daysAgo: 17 },
  { description: "Parking", category: "transport", amount: 24, daysAgo: 19 },
  { description: "Zakupy spożywcze", category: "food", amount: 201.3, daysAgo: 21 },
];

// Poprzedni miesiąc: stałe dni, żeby przełącznik miesięcy i porównania miały co pokazać.
// Wpisy z recurring_kind to płatności cykliczne zaksięgowane w tamtym miesiącu.
const DEMO_PREVIOUS_MONTH: Array<DemoExpense & { day: number }> = [
  { description: "Czynsz", category: "home", amount: 1850, day: 1, recurring_kind: "fixed" },
  { description: "Netflix", category: "fun", amount: 43.99, day: 2, recurring_kind: "subscription" },
  { description: "Zakupy spożywcze", category: "food", amount: 198.2, day: 4 },
  { description: "Spotify", category: "fun", amount: 23.99, day: 5, recurring_kind: "subscription" },
  { description: "GitHub Copilot", category: "work", amount: 40, day: 6, recurring_kind: "subscription" },
  { description: "Paliwo", category: "transport", amount: 380, day: 6 },
  { description: "Telefon", category: "bills", amount: 49, day: 8, recurring_kind: "fixed" },
  { description: "Prąd", category: "bills", amount: 171.2, day: 9 },
  { description: "Zakupy spożywcze", category: "food", amount: 164.9, day: 11 },
  { description: "Internet", category: "bills", amount: 59.99, day: 11, recurring_kind: "fixed" },
  { description: "Siłownia", category: "health", amount: 129, day: 11, recurring_kind: "fixed" },
  { description: "Kino i kolacja", category: "fun", amount: 140, day: 14 },
  { description: "Buty", category: "shopping", amount: 260, day: 18 },
  { description: "AWS", category: "work", amount: 120.5, day: 20, recurring_kind: "subscription" },
  { description: "Dentysta", category: "health", amount: 55, day: 20 },
  { description: "Zakupy spożywcze", category: "food", amount: 189.5, day: 23 },
  { description: "Środki czystości", category: "home", amount: 92.4, day: 25 },
  { description: "Zakupy spożywcze", category: "food", amount: 142.3, day: 28 },
];

const DEMO_BUDGETS = [
  { category: "total", amount: 4800 },
  { category: "food", amount: 900 },
  { category: "transport", amount: 450 },
  { category: "fun", amount: 300 },
  { category: "shopping", amount: 400 },
];

// Daty liczymy względem "dziś", żeby demo zawsze wyglądało na żywe.
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

async function seedDemoData(userId: string): Promise<string | null> {
  const recurringRows = buildRecurring().map(({ inDays, ...r }) => ({
    user_id: userId,
    ...r,
    next_renewal: daysFromNow(inDays),
  }));

  const { error } = await supabase.from("subscriptions").insert(recurringRows);
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

  // Wydatki i budżety są dodatkiem - ich ewentualny błąd nie blokuje startu demo.
  const { error: expensesError } = await supabase.from("expenses").insert([...currentRows, ...previousRows]);
  if (expensesError) console.warn("Nie udało się dodać wydatków demo:", expensesError.message);

  const { error: budgetsError } = await supabase
    .from("budgets")
    .insert(DEMO_BUDGETS.map((b) => ({ user_id: userId, ...b })));
  if (budgetsError) console.warn("Nie udało się dodać budżetów demo:", budgetsError.message);

  await supabase.from("profiles").update({ budget_limit: DEMO_SUBSCRIPTION_LIMIT }).eq("id", userId);

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

  // BEZPIECZNIK: reset kasuje dane, więc wolno go wykonać wyłącznie na koncie anonimowym.
  // Prawdziwy użytkownik nigdy nie straci danych.
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