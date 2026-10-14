import type { Expense } from "@/lib/use-expenses";
import { daysInMonth, monthKey, parseMonthKey } from "@/lib/dates";
import { getExpenseCategoryMeta } from "@/lib/expense-categories";

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface CategorySpend {
  category: string;
  label: string;
  color: string;
  spent: number;
  share: number;
}

export interface DailyPoint {
  day: number;
  label: string;
  amount: number;
  cumulative: number;
}

export interface MonthSummary {
  month: string;
  isCurrent: boolean;
  daysTotal: number;
  daysElapsed: number;
  count: number;
  expensesTotal: number;
  subscriptionsTotal: number;
  total: number;
  byCategory: CategorySpend[];
  daily: DailyPoint[];
  dailyAverage: number;
  projectedTotal: number | null;
}

// Subskrypcje liczymy wg AKTUALNEJ listy (system nie przechowuje historii zmian cen).
export function summarizeMonth(
  expenses: Expense[],
  subscriptionsMonthly: number,
  month: string
): MonthSummary {
  const inMonth = expenses.filter((e) => e.spent_on.startsWith(month));
  const daysTotal = daysInMonth(month);
  const current = monthKey();
  const isCurrent = month === current;
  const isPast = month < current; // porownanie tekstowe dziala dla formatu YYYY-MM
  const daysElapsed = isCurrent ? new Date().getDate() : isPast ? daysTotal : 0;

  const spent: Record<string, number> = {};
  const perDay = new Array<number>(daysTotal).fill(0);
  let expensesTotal = 0;

  for (const e of inMonth) {
    spent[e.category] = (spent[e.category] ?? 0) + e.amount;
    const day = Number(e.spent_on.slice(8, 10));
    if (day >= 1 && day <= daysTotal) perDay[day - 1] += e.amount;
    expensesTotal += e.amount;
  }

  const subscriptionsTotal = subscriptionsMonthly;
  const total = expensesTotal + subscriptionsTotal;
  if (subscriptionsTotal > 0) spent.subscriptions = subscriptionsTotal;

  const byCategory: CategorySpend[] = Object.entries(spent)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => {
      const meta = getExpenseCategoryMeta(category);
      return {
        category,
        label: meta.label,
        color: meta.color,
        spent: round2(value),
        share: total > 0 ? value / total : 0,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const { year, month: m } = parseMonthKey(month);
  let running = 0;
  const daily: DailyPoint[] = perDay.map((amount, i) => {
    running += amount;
    return {
      day: i + 1,
      label: new Date(year, m - 1, i + 1).toLocaleDateString("pl-PL", { day: "numeric", month: "long" }),
      amount: round2(amount),
      cumulative: round2(running),
    };
  });

  const dailyAverage = daysElapsed > 0 ? expensesTotal / daysElapsed : 0;
  const projectedTotal =
    isCurrent && daysElapsed > 0 ? (expensesTotal / daysElapsed) * daysTotal + subscriptionsTotal : null;

  return {
    month,
    isCurrent,
    daysTotal,
    daysElapsed,
    count: inMonth.length,
    expensesTotal: round2(expensesTotal),
    subscriptionsTotal: round2(subscriptionsTotal),
    total: round2(total),
    byCategory,
    daily,
    dailyAverage: round2(dailyAverage),
    projectedTotal: projectedTotal === null ? null : round2(projectedTotal),
  };
}

// Porownanie "uczciwe": w trwajacym miesiacu zestawiamy z poprzednim do TEGO SAMEGO dnia,
// a nie z jego pelna suma (inaczej 10. dnia miesiaca zawsze wygladalibysmy swietnie).
export function comparablePrevious(summary: MonthSummary, previous: MonthSummary): number {
  if (!summary.isCurrent) return previous.expensesTotal;
  return previous.daily.slice(0, summary.daysElapsed).reduce((sum, p) => sum + p.amount, 0);
}