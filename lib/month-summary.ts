import type { Expense } from "@/lib/use-expenses";
import type { Subscription } from "@/lib/use-subscriptions";
import { daysInMonth, monthKey, parseMonthKey, toISODate } from "@/lib/dates";
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
  amount: number; // razem tego dnia
  fixed: number; // z płatności cyklicznych
  variable: number; // pozostałe
  cumulative: number;
}

export interface MonthSummary {
  month: string;
  isCurrent: boolean;
  daysTotal: number;
  daysElapsed: number;
  count: number;
  total: number; // wszystko, co wydano w miesiącu
  fixedTotal: number; // koszty stałe (płatności cykliczne)
  variableTotal: number; // koszty zmienne
  scheduled: number; // płatności cykliczne, które jeszcze padną w tym miesiącu
  byCategory: CategorySpend[];
  daily: DailyPoint[];
  dailyAverage: number; // średnia dzienna kosztów zmiennych
  projectedTotal: number | null;
}

export function isRecurringExpense(e: Expense): boolean {
  return Boolean(e.recurring_id || e.recurring_kind);
}

// Suma płatności cyklicznych, które padną jeszcze w tym miesiącu (po dzisiejszym dniu).
export function scheduledRemaining(subscriptions: Subscription[]): number {
  const today = toISODate(new Date());
  const month = today.slice(0, 7);

  return subscriptions
    .filter((s) => s.next_renewal > today && s.next_renewal.startsWith(month))
    .reduce((sum, s) => sum + s.price, 0);
}

export function summarizeMonth(expenses: Expense[], month: string, scheduled = 0): MonthSummary {
  const inMonth = expenses.filter((e) => e.spent_on.startsWith(month));
  const daysTotal = daysInMonth(month);
  const current = monthKey();
  const isCurrent = month === current;
  const isPast = month < current; // porównanie tekstowe działa dla formatu YYYY-MM
  const daysElapsed = isCurrent ? new Date().getDate() : isPast ? daysTotal : 0;

  const spent: Record<string, number> = {};
  const fixedPerDay = new Array<number>(daysTotal).fill(0);
  const variablePerDay = new Array<number>(daysTotal).fill(0);
  let fixedTotal = 0;
  let variableTotal = 0;

  for (const e of inMonth) {
    spent[e.category] = (spent[e.category] ?? 0) + e.amount;

    const fixed = isRecurringExpense(e);
    if (fixed) fixedTotal += e.amount;
    else variableTotal += e.amount;

    const day = Number(e.spent_on.slice(8, 10));
    if (day >= 1 && day <= daysTotal) {
      (fixed ? fixedPerDay : variablePerDay)[day - 1] += e.amount;
    }
  }

  const total = fixedTotal + variableTotal;

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
  const daily: DailyPoint[] = fixedPerDay.map((fixed, i) => {
    const variable = variablePerDay[i];
    running += fixed + variable;
    return {
      day: i + 1,
      label: new Date(year, m - 1, i + 1).toLocaleDateString("pl-PL", { day: "numeric", month: "long" }),
      amount: round2(fixed + variable),
      fixed: round2(fixed),
      variable: round2(variable),
      cumulative: round2(running),
    };
  });

  const dailyAverage = daysElapsed > 0 ? variableTotal / daysElapsed : 0;
  const remainingDays = Math.max(daysTotal - daysElapsed, 0);

  // Prognoza: wydano + tempo kosztów zmiennych na pozostałe dni + zaplanowane płatności cykliczne.
  // W pierwszych dniach miesiąca próbka jest za mała, więc jej nie pokazujemy.
  const projectedTotal =
    isCurrent && daysElapsed >= 3 ? total + dailyAverage * remainingDays + scheduled : null;

  return {
    month,
    isCurrent,
    daysTotal,
    daysElapsed,
    count: inMonth.length,
    total: round2(total),
    fixedTotal: round2(fixedTotal),
    variableTotal: round2(variableTotal),
    scheduled: round2(isCurrent ? scheduled : 0),
    byCategory,
    daily,
    dailyAverage: round2(dailyAverage),
    projectedTotal: projectedTotal === null ? null : round2(projectedTotal),
  };
}

// Porównanie "uczciwe": w trwającym miesiącu zestawiamy z poprzednim do TEGO SAMEGO dnia,
// a nie z jego pełną sumą (inaczej 10. dnia miesiąca zawsze wyglądalibyśmy świetnie).
export function comparablePrevious(summary: MonthSummary, previous: MonthSummary): number {
  if (!summary.isCurrent) return previous.total;
  return previous.daily.slice(0, summary.daysElapsed).reduce((sum, p) => sum + p.amount, 0);
}