"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPLN } from "@/lib/analytics";
import { monthLabel } from "@/lib/dates";
import type { MonthSummary } from "@/lib/month-summary";
import type { MonthTotal } from "@/lib/use-month-totals";
import { ChartTooltipCard, type RechartsTooltipProps } from "@/components/chart-tooltip";

const axisTick = { fill: "#8B93A5", fontSize: 12 };

interface TrendDatum {
  label: string;
  title: string;
  fixed: number;
  variable: number;
  total: number;
  current: boolean;
}

function TrendTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as unknown as TrendDatum | undefined;
  if (!d) return null;

  return (
    <ChartTooltipCard
      title={d.current ? `${d.title} (w toku)` : d.title}
      rows={[
        { color: "#34D399", label: "Zmienne", value: formatPLN(d.variable) },
        { color: "#818CF8", label: "Stałe (cykliczne)", value: formatPLN(d.fixed) },
      ]}
      footer={{ label: "Razem", value: formatPLN(d.total) }}
    />
  );
}

export function TrendChart({ history, current }: { history: MonthTotal[]; current: MonthSummary }) {
  const data: TrendDatum[] = [
    ...history.map((h) => ({
      label: h.label,
      title: monthLabel(h.month),
      fixed: h.fixed,
      variable: h.variable,
      total: h.total,
      current: false,
    })),
    {
      label: "teraz",
      title: monthLabel(current.month),
      fixed: current.fixedTotal,
      variable: current.variableTotal,
      total: current.total,
      current: true,
    },
  ];

  const completed = history.filter((h) => h.total > 0);
  const average = completed.length ? completed.reduce((sum, h) => sum + h.total, 0) / completed.length : 0;
  const projected = current.projectedTotal;
  const delta = average > 0 && projected !== null ? ((projected - average) / average) * 100 : null;
  const isEmpty = data.every((d) => d.total === 0);

  return (
    <div className="glass-card h-full p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Trend wydatków</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ostatnie miesiące. Ostatni słupek to bieżący miesiąc w toku.
          </p>
        </div>

        {average > 0 && (
          <div className="text-right">
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">{formatPLN(average)}</p>
            <p className="text-[11px] text-muted-foreground">średnio na miesiąc</p>
          </div>
        )}
      </div>

      {isEmpty ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Trend pojawi się, gdy uzbiera się historia wydatków.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barCategoryGap="22%">
              <defs>
                <linearGradient id="trend-variable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="trend-fixed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={50} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<TrendTooltip />} />
              {average > 0 && (
                <ReferenceLine y={average} stroke="#FBBF24" strokeDasharray="4 4" strokeOpacity={0.8} />
              )}
              <Bar dataKey="variable" stackId="m" fill="url(#trend-variable)" radius={[4, 4, 0, 0]} animationDuration={900}>
                {data.map((d, i) => (
                  <Cell key={i} fillOpacity={d.current ? 0.55 : 1} />
                ))}
              </Bar>
              <Bar dataKey="fixed" stackId="m" fill="url(#trend-fixed)" radius={[4, 4, 0, 0]} animationDuration={900}>
                {data.map((d, i) => (
                  <Cell key={i} fillOpacity={d.current ? 0.55 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Zmienne
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Stałe (cykliczne)
              </span>
            </div>

            {delta !== null && projected !== null && (
              <p className="text-xs text-muted-foreground">
                Prognoza tego miesiąca <span className="font-mono text-foreground">{formatPLN(projected)}</span>{" "}
                <span className={delta <= 0 ? "text-emerald-300" : "text-red-300"}>
                  ({delta > 0 ? "+" : ""}
                  {Math.round(delta)}% vs średnia)
                </span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}