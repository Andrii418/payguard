"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPLN } from "@/lib/analytics";
import type { CategorySpend, MonthSummary } from "@/lib/month-summary";
import { ChartTooltipCard, type RechartsTooltipProps } from "@/components/chart-tooltip";

function DonutTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload as unknown as CategorySpend | undefined;
  if (!slice) return null;

  return (
    <ChartTooltipCard
      title={slice.label}
      rows={[{ color: slice.color, label: "Wydano", value: formatPLN(slice.spent) }]}
      footer={{ label: "Udział w wydatkach", value: `${Math.round(slice.share * 100)}%` }}
    />
  );
}

export function CategoryDonut({ summary }: { summary: MonthSummary }) {
  const data = summary.byCategory;

  return (
    <div className="glass-card h-full p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Na co idą pieniądze</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Podział wydatków w tym miesiącu</p>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Brak wydatków w tym miesiącu.</p>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-[210px] w-full max-w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<DonutTooltip />} />
                <Pie
                  data={data}
                  dataKey="spent"
                  nameKey="label"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                  animationDuration={900}
                >
                  {data.map((d) => (
                    <Cell key={d.category} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] text-muted-foreground">Razem</span>
              <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {formatPLN(summary.total)}
              </span>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {data.slice(0, 6).map((d) => (
              <li key={d.category} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="flex-1 truncate text-muted-foreground">{d.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {Math.round(d.share * 100)}%
                </span>
                <span className="w-24 text-right font-mono text-sm tabular-nums text-foreground">
                  {formatPLN(d.spent)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}