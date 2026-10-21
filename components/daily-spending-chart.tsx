"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPLN } from "@/lib/analytics";
import type { DailyPoint, MonthSummary } from "@/lib/month-summary";
import { ChartTooltipCard, type RechartsTooltipProps } from "@/components/chart-tooltip";

const axisTick = { fill: "#8B93A5", fontSize: 12 };

function DailyTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as unknown as DailyPoint | undefined;
  if (!point) return null;

  const rows = [{ color: "#34D399", label: "Zmienne", value: formatPLN(point.variable) }];
  if (point.fixed > 0) rows.push({ color: "#818CF8", label: "Stałe (cykliczne)", value: formatPLN(point.fixed) });

  return (
    <ChartTooltipCard
      title={point.label}
      rows={rows}
      footer={{ label: "Narastająco w miesiącu", value: formatPLN(point.cumulative) }}
    />
  );
}

export function DailySpendingChart({ summary }: { summary: MonthSummary }) {
  const { daily, dailyAverage, total } = summary;

  return (
    <div className="glass-card h-full p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Wydatki dzień po dniu</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Linia przerywana to średnia dzienna kosztów zmiennych.
        </p>
      </div>

      {total === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Dodaj pierwszy wydatek, a zobaczysz tu wykres miesiąca.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barCategoryGap="18%">
              <defs>
                <linearGradient id="daily-variable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="daily-fixed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="day"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                interval={daily.length > 20 ? 4 : 1}
              />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={46} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<DailyTooltip />} />
              {dailyAverage > 0 && (
                <ReferenceLine y={dailyAverage} stroke="#FBBF24" strokeDasharray="4 4" strokeOpacity={0.8} />
              )}
              <Bar dataKey="variable" stackId="day" fill="url(#daily-variable)" radius={[4, 4, 0, 0]} animationDuration={900} />
              <Bar dataKey="fixed" stackId="day" fill="url(#daily-fixed)" radius={[4, 4, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Zmienne
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Stałe (cykliczne)
            </span>
          </div>
        </>
      )}
    </div>
  );
}