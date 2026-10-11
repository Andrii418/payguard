import type { Subscription } from "@/lib/use-subscriptions";
import { CATEGORY_ORDER, getCategoryMeta } from "@/lib/category-meta";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const formatPLN = (n: number) =>
  `${n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;

export function monthlyEquivalent(s: Subscription): number {
  return s.billing_cycle === "monthly" ? s.price : s.price / 12;
}

export function totalMonthly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
}

// Liczymy względem lokalnej północy, żeby uniknąć błędu "o jeden dzień" przy strefach czasowych.
export function daysUntil(dateString: string): number {
  const target = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export interface CategorySlice {
  category: string;
  label: string;
  short: string;
  color: string;
  total: number;
  share: number;
}

export function categoryBreakdown(subs: Subscription[]): CategorySlice[] {
  const totals: Record<string, number> = {};
  for (const s of subs) totals[s.category] = (totals[s.category] ?? 0) + monthlyEquivalent(s);
  const grand = Object.values(totals).reduce((a, b) => a + b, 0);

  return Object.entries(totals)
    .map(([category, total]) => {
      const meta = getCategoryMeta(category);
      return {
        category,
        label: meta.label,
        short: meta.short,
        color: meta.color,
        total: round2(total),
        share: grand > 0 ? total / grand : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function activeCategories(subs: Subscription[]): string[] {
  const present = new Set(subs.map((s) => s.category));
  const known = CATEGORY_ORDER.filter((c) => present.has(c));
  const unknown = [...present].filter((c) => !(CATEGORY_ORDER as readonly string[]).includes(c));
  return [...known, ...unknown];
}

// Heurystyka: w każdej kategorii z więcej niż jedną usługą "nadmiarowe" są wszystkie poza najtańszą.
export function possibleSavings(subs: Subscription[]): number {
  const groups: Record<string, number[]> = {};
  for (const s of subs) (groups[s.category] ??= []).push(monthlyEquivalent(s));

  return Object.values(groups).reduce((sum, prices) => {
    if (prices.length <= 1) return sum;
    const [, ...extra] = [...prices].sort((a, b) => a - b);
    return sum + extra.reduce((a, b) => a + b, 0);
  }, 0);
}

export function nextRenewal(subs: Subscription[]): { name: string; days: number } | null {
  const upcoming = subs
    .map((s) => ({ name: s.name, days: daysUntil(s.next_renewal) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days);
  return upcoming[0] ?? null;
}

export interface UpcomingPoint {
  day: number;
  label: string;
  amount: number;
  cumulative: number;
}

// Narastająca suma realnych płatności w najbliższych 30 dniach (wykres schodkowy).
export function upcomingSeries(subs: Subscription[], horizon = 30): UpcomingPoint[] {
  const base = new Date();
  const points: UpcomingPoint[] = Array.from({ length: horizon + 1 }, (_, day) => {
    const d = new Date(base);
    d.setDate(base.getDate() + day);
    return {
      day,
      label: d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
      amount: 0,
      cumulative: 0,
    };
  });

  for (const s of subs) {
    const d = daysUntil(s.next_renewal);
    if (d >= 0 && d <= horizon) points[d].amount += s.price;
  }

  let running = 0;
  for (const p of points) {
    running += p.amount;
    p.amount = round2(p.amount);
    p.cumulative = round2(running);
  }
  return points;
}

// Skumulowana prognoza wydatków na kolejne miesiące, z podziałem na kategorie.
export function burnRateSeries(subs: Subscription[], months = 6): Array<Record<string, string | number>> {
  const monthly: Record<string, number> = {};
  for (const s of subs) monthly[s.category] = (monthly[s.category] ?? 0) + monthlyEquivalent(s);

  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const row: Record<string, string | number> = {
      month: d.toLocaleDateString("pl-PL", { month: "short" }),
    };
    let total = 0;
    for (const [category, value] of Object.entries(monthly)) {
      const cumulative = round2(value * (i + 1));
      row[category] = cumulative;
      total += cumulative;
    }
    row.total = round2(total);
    return row;
  });
}