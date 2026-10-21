import type { Expense } from "@/lib/use-expenses";
import type { Subscription } from "@/lib/use-subscriptions";
import { shiftMonth, monthLabel } from "@/lib/dates";
import { daysUntil, monthlyEquivalent } from "@/lib/analytics";
import { getExpenseCategoryMeta } from "@/lib/expense-categories";
import { comparablePrevious, isRecurringExpense, scheduledRemaining, summarizeMonth } from "@/lib/month-summary";
import type { BudgetSnapshot } from "@/lib/budget-snapshot-schema";

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

interface SnapshotInput {
  expenses: Expense[]; // bieżący i poprzedni miesiąc
  subscriptions: Subscription[]; // wszystkie płatności cykliczne
  limits: Record<string, number>;
  month: string; // bieżący miesiąc, YYYY-MM
}

export function buildBudgetSnapshot({ expenses, subscriptions, limits, month }: SnapshotInput): BudgetSnapshot {
  const scheduled = scheduledRemaining(subscriptions);
  const summary = summarizeMonth(expenses, month, scheduled);
  const previousKey = shiftMonth(month, -1);
  const previous = summarizeMonth(expenses, previousKey);
  const previousSame = comparablePrevious(summary, previous);

  // Poprzedni miesiąc "do tego samego dnia", osobno dla każdej kategorii
  const previousByCategory: Record<string, number> = {};
  for (const e of expenses) {
    if (!e.spent_on.startsWith(previousKey)) continue;
    const day = Number(e.spent_on.slice(8, 10));
    if (summary.isCurrent && day > summary.daysElapsed) continue;
    previousByCategory[e.category] = (previousByCategory[e.category] ?? 0) + e.amount;
  }

  const totalLimit = limits.total ?? null;
  const daysLeft = summary.isCurrent ? summary.daysTotal - summary.daysElapsed : 0;
  const free = totalLimit !== null ? totalLimit - summary.total - scheduled : null;
  const freePerDay = free !== null && free > 0 && daysLeft + 1 > 0 && summary.isCurrent ? free / (daysLeft + 1) : null;

  // Kategorie z wydatkami oraz te, które mają ustawiony limit (nawet jeśli jeszcze nic w nich nie wydano)
  const keys = new Set<string>([
    ...summary.byCategory.map((c) => c.category),
    ...Object.keys(limits).filter((k) => k !== "total" && k !== "subscriptions"),
  ]);

  const categories = [...keys]
    .map((key) => {
      const spent = summary.byCategory.find((c) => c.category === key)?.spent ?? 0;
      const limit = limits[key] ?? null;
      return {
        label: getExpenseCategoryMeta(key).label,
        spent: round2(spent),
        sharePercent: summary.total > 0 ? round1((spent / summary.total) * 100) : 0,
        limit,
        limitUsagePercent: limit ? round1((spent / limit) * 100) : null,
        previousSamePeriod: round2(previousByCategory[key] ?? 0),
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 12);

  const recurring = subscriptions.slice(0, 60).map((s) => ({
    name: s.name.slice(0, 60),
    category: getExpenseCategoryMeta(s.category).label,
    kind: s.kind ?? "subscription",
    monthlyAmount: round2(monthlyEquivalent(s)),
    billing: s.billing_cycle,
    daysUntilNext: daysUntil(s.next_renewal),
  }));

  // Największe wydatki zmienne: tylko kategoria i kwota, bez opisów (prywatność)
  const largestVariable = expenses
    .filter((e) => e.spent_on.startsWith(month) && !isRecurringExpense(e))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((e) => ({ category: getExpenseCategoryMeta(e.category).label, amount: round2(e.amount) }));

  return {
    monthLabel: monthLabel(month),
    isCurrentMonth: summary.isCurrent,
    dayOfMonth: summary.isCurrent ? summary.daysElapsed : summary.daysTotal,
    daysInMonth: summary.daysTotal,
    daysLeft,
    totals: {
      spent: summary.total,
      fixed: summary.fixedTotal,
      variable: summary.variableTotal,
      scheduledRemaining: summary.scheduled,
      projected: summary.projectedTotal,
      dailyAverageVariable: summary.dailyAverage,
    },
    budget: {
      limit: totalLimit,
      usagePercent: totalLimit ? round1((summary.total / totalLimit) * 100) : null,
      remaining: totalLimit !== null ? round2(totalLimit - summary.total) : null,
      freePerDay: freePerDay !== null ? round2(freePerDay) : null,
    },
    previous: {
      monthLabel: monthLabel(previousKey),
      spentSamePeriod: round2(previousSame),
      spentTotal: previous.total,
      changePercent: previousSame > 0 ? round1(((summary.total - previousSame) / previousSame) * 100) : null,
    },
    categories,
    recurring,
    recurringMonthlyTotal: round2(subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s), 0)),
    largestVariable,
    expenseCount: summary.count,
  };
}