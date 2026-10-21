import { formatPLN } from "@/lib/analytics";
import type { MonthSummary } from "@/lib/month-summary";

export interface Insight {
  id: string;
  tone: "danger" | "warning" | "info" | "good";
  text: string;
}

interface InsightInput {
  summary: MonthSummary;
  limits: Record<string, number>;
  subscriptionsMonthly: number; // koszt samych subskrypcji (bez opłat stałych) na miesiąc
}

export function buildInsights({ summary, limits, subscriptionsMonthly }: InsightInput): Insight[] {
  const out: Insight[] = [];
  const totalLimit = limits.total;

  if (totalLimit) {
    const usage = summary.total / totalLimit;

    if (usage > 1) {
      out.push({
        id: "total-over",
        tone: "danger",
        text: `Przekroczono budżet miesiąca o ${formatPLN(summary.total - totalLimit)}.`,
      });
    } else if (summary.projectedTotal !== null && summary.projectedTotal > totalLimit) {
      out.push({
        id: "total-projected",
        tone: "warning",
        text: `W obecnym tempie miesiąc skończy się na ok. ${formatPLN(summary.projectedTotal)}, czyli ${formatPLN(
          summary.projectedTotal - totalLimit
        )} ponad budżet.`,
      });
    } else if (summary.isCurrent && usage >= 0.85) {
      out.push({
        id: "total-high",
        tone: "warning",
        text: `Wykorzystano już ${Math.round(usage * 100)}% budżetu miesiąca.`,
      });
    }
  }

  for (const c of summary.byCategory) {
    const limit = limits[c.category];
    if (!limit) continue;
    const usage = c.spent / limit;

    if (usage > 1) {
      out.push({
        id: `cat-over-${c.category}`,
        tone: "danger",
        text: `${c.label}: przekroczono limit o ${formatPLN(c.spent - limit)}.`,
      });
    } else if (usage >= 0.85) {
      out.push({
        id: `cat-high-${c.category}`,
        tone: "warning",
        text: `${c.label}: wykorzystano ${Math.round(usage * 100)}% limitu.`,
      });
    }
  }

  const subscriptionsLimit = limits.subscriptions;
  if (subscriptionsLimit && subscriptionsMonthly > subscriptionsLimit) {
    out.push({
      id: "subs-over",
      tone: "warning",
      text: `Subskrypcje kosztują ${formatPLN(subscriptionsMonthly)} miesięcznie przy limicie ${formatPLN(
        subscriptionsLimit
      )}.`,
    });
  }

  const order = { danger: 0, warning: 1, info: 2, good: 3 } as const;
  const sorted = out.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 4);

  if (sorted.length === 0 && totalLimit) {
    return [{ id: "ok", tone: "good", text: "Budżet miesiąca pod kontrolą. Żadnych alertów." }];
  }

  return sorted;
}