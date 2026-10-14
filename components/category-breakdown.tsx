"use client";

import { formatPLN } from "@/lib/analytics";
import { EXPENSE_CATEGORY_KEYS, getExpenseCategoryMeta } from "@/lib/expense-categories";
import type { MonthSummary } from "@/lib/month-summary";
import { LimitEditor } from "@/components/limit-editor";

function toneColor(usage: number) {
  if (usage > 100) return "#F87171";
  if (usage > 75) return "#FBBF24";
  return "#34D399";
}

interface CategoryBreakdownProps {
  summary: MonthSummary;
  limits: Record<string, number>;
  onSaveLimit: (category: string, amount: number | null) => Promise<string | null>;
}

export function CategoryBreakdown({ summary, limits, onSaveLimit }: CategoryBreakdownProps) {
  const spentMap = new Map(summary.byCategory.map((c) => [c.category, c]));

  const rows = [...EXPENSE_CATEGORY_KEYS, "subscriptions"]
    .map((key) => {
      const meta = getExpenseCategoryMeta(key);
      const entry = spentMap.get(key);
      const spent = entry?.spent ?? 0;
      const limit = limits[key] ?? null;
      return {
        key,
        meta,
        spent,
        share: entry?.share ?? 0,
        limit,
        usage: limit ? (spent / limit) * 100 : null,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="glass-card h-full p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Kategorie i limity</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Kliknij „Ustaw limit”, a zobaczysz, jak szybko go zużywasz.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {rows.map(({ key, meta, spent, share, limit, usage }) => {
          const Icon = meta.icon;
          const dim = spent === 0 && !limit;

          return (
            <div key={key} className={dim ? "opacity-60" : ""}>
              <div className="mb-1.5 flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">{meta.label}</p>
                <div className="flex flex-col items-end gap-0.5">
                  <p className="font-mono text-sm tabular-nums text-foreground">{formatPLN(spent)}</p>
                  <LimitEditor value={limit} onSave={(amount) => onSaveLimit(key, amount)} />
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usage !== null ? Math.min(usage, 100) : share * 100}%`,
                    backgroundColor: usage !== null ? toneColor(usage) : meta.color,
                  }}
                />
              </div>

              {limit !== null && usage !== null && usage > 100 && (
                <p className="mt-1 text-[11px] text-red-300">
                  Przekroczono o {formatPLN(spent - limit)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
        Subskrypcje liczone są wg aktualnej listy. Ich limit jest taki sam jak w Ustawieniach.
      </p>
    </div>
  );
}