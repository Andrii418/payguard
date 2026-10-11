"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, TrendingUp } from "lucide-react";
import type { Subscription } from "@/lib/use-subscriptions";
import { formatPLN, upcomingSeries, type UpcomingPoint } from "@/lib/analytics";
import { AnimatedNumber } from "@/components/animated-number";
import { ChartTooltipCard, type RechartsTooltipProps } from "@/components/chart-tooltip";

function HeroTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as unknown as UpcomingPoint | undefined;
  if (!point) return null;

  const rows = [{ color: "#34D399", label: "Narastająco", value: formatPLN(point.cumulative) }];
  if (point.amount > 0) rows.push({ color: "#FBBF24", label: "Płatność tego dnia", value: formatPLN(point.amount) });

  return <ChartTooltipCard title={point.label} rows={rows} />;
}

function budgetBarClass(usage: number) {
  if (usage > 100) return "bg-linear-to-r from-red-500 to-orange-400";
  if (usage > 75) return "bg-linear-to-r from-amber-400 to-orange-400";
  return "bg-linear-to-r from-emerald-400 to-sky-400";
}

interface DashboardHeroProps {
  subscriptions: Subscription[];
  monthlyCost: number;
  budgetLimit: number | null;
}

export function DashboardHero({ subscriptions, monthlyCost, budgetLimit }: DashboardHeroProps) {
  const series = upcomingSeries(subscriptions, 30);
  const next30 = series[series.length - 1]?.cumulative ?? 0;
  const usage = budgetLimit ? (monthlyCost / budgetLimit) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative flex flex-col overflow-hidden p-6 lg:col-span-2"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 animate-pulse-glow rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Miesięczny koszt subskrypcji</p>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Na żywo
        </span>
      </div>

      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
          <AnimatedNumber value={monthlyCost} />
        </span>
        <span className="font-mono text-xl text-muted-foreground">zł</span>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-400" />≈ {formatPLN(monthlyCost * 12)} rocznie
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4 text-amber-300" />
          {formatPLN(next30)} do zapłaty w 30 dni
        </span>
      </div>

      {usage !== null && budgetLimit !== null ? (
        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Limit budżetu</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatPLN(monthlyCost)} / {formatPLN(budgetLimit)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usage, 100)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${budgetBarClass(usage)}`}
            />
          </div>
        </div>
      ) : (
        <Link
          href="/settings"
          className="relative mt-5 w-fit text-xs text-muted-foreground transition-colors hover:text-emerald-400"
        >
          Ustaw miesięczny limit budżetu →
        </Link>
      )}

      <div className="relative mt-6 min-h-[200px] flex-1">
        <p className="mb-1 text-xs text-muted-foreground">Płatności w najbliższych 30 dniach</p>
        {subscriptions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Dodaj pierwszą subskrypcję, a tu pojawi się oś Twoich płatności.
          </p>
        ) : (
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8B93A5", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis hide domain={[0, "dataMax"]} />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.25)", strokeDasharray: "4 4" }}
                  content={<HeroTooltip />}
                />
                <Area
                  type="stepAfter"
                  dataKey="cumulative"
                  stroke="url(#hero-stroke)"
                  strokeWidth={2.5}
                  fill="url(#hero-fill)"
                  animationDuration={1400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}