"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Subscription } from "@/lib/use-subscriptions";
import {
  activeCategories,
  burnRateSeries,
  categoryBreakdown,
  formatPLN,
  totalMonthly,
  type CategorySlice,
} from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/category-meta";
import { ChartTooltipCard, type RechartsTooltipProps } from "@/components/chart-tooltip";

const axisTick = { fill: "#8B93A5", fontSize: 12 };
const gridStroke = "rgba(255,255,255,0.05)";

function CategoryTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload as unknown as CategorySlice | undefined;
  if (!slice) return null;

  return (
    <ChartTooltipCard
      title={slice.label}
      rows={[{ color: slice.color, label: "Koszt miesięczny", value: formatPLN(slice.total) }]}
      footer={{ label: "Udział w wydatkach", value: `${Math.round(slice.share * 100)}%` }}
    />
  );
}

function BurnTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  const rows = [...payload].reverse().map((item) => {
    const meta = getCategoryMeta(String(item.dataKey));
    return { color: meta.color, label: meta.short, value: formatPLN(Number(item.value ?? 0)) };
  });
  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  return (
    <ChartTooltipCard
      title={`Prognoza: ${label}`}
      rows={rows}
      footer={{ label: "Razem narastająco", value: formatPLN(total) }}
    />
  );
}

export function CategoryChartCard({ subscriptions }: { subscriptions: Subscription[] }) {
  const data = categoryBreakdown(subscriptions);
  const total = totalMonthly(subscriptions);

  return (
    <div className="glass-card flex h-full flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Wydatki wg kategorii</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Koszt miesięczny w przeliczeniu na zł</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs tabular-nums text-foreground">
          {formatPLN(total)}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Brak danych do wyświetlenia.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barCategoryGap="24%">
              <defs>
                {data.map((d) => (
                  <linearGradient key={d.category} id={`bar-${d.category}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={d.color} stopOpacity={0.2} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="short" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={46} />
              {/* cursor z ciemnym tłem zamiast domyślnego białego prostokąta */}
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<CategoryTooltip />} />
              <Bar dataKey="total" radius={[10, 10, 2, 2]} animationDuration={1100}>
                {data.map((d) => (
                  <Cell key={d.category} fill={`url(#bar-${d.category})`} stroke={d.color} strokeOpacity={0.55} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {data.map((d) => (
              <div key={d.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.short}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">{Math.round(d.share * 100)}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.share * 100}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function BurnRateChartCard({ subscriptions }: { subscriptions: Subscription[] }) {
  const data = burnRateSeries(subscriptions, 6);
  const categories = activeCategories(subscriptions);
  const monthly = totalMonthly(subscriptions);
  const sixMonthTotal = Number(data[data.length - 1]?.total ?? 0);

  return (
    <div className="glass-card flex h-full flex-col p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Prognoza wydatków (burn rate)</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Skumulowany koszt na 6 miesięcy, jeśli nic nie zmienisz
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-semibold tabular-nums text-foreground">{formatPLN(sixMonthTotal)}</p>
          <p className="font-mono text-xs tabular-nums text-rose-300">+{formatPLN(monthly)} / mies.</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Brak danych do wyświetlenia.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
              <defs>
                {categories.map((c) => {
                  const color = getCategoryMeta(c).color;
                  return (
                    <linearGradient key={c} id={`area-${c}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={50} />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeDasharray: "4 4" }}
                content={<BurnTooltip />}
              />
              {categories.map((c) => (
                <Area
                  key={c}
                  type="monotone"
                  dataKey={c}
                  stackId="burn"
                  stroke={getCategoryMeta(c).color}
                  strokeWidth={2}
                  fill={`url(#area-${c})`}
                  animationDuration={1300}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {categories.map((c) => {
              const meta = getCategoryMeta(c);
              return (
                <span key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                  />
                  {meta.short}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}